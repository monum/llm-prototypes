from flask import Flask
import os
from llama_index import SimpleDirectoryReader,  GoogleDocsReader, download_loader
from flask import request
from flask_cors import CORS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from pathlib import Path
import openai
import config

from langchain.agents import Tool, AgentExecutor, initialize_agent
from langchain.agents.loading import AGENT_TO_CLASS, load_agent
from langchain.chains.conversation.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI

from llama_index.langchain_helpers.agents import IndexToolConfig, LlamaToolkit, create_llama_chat_agent, LlamaIndexTool
from llama_index.storage.docstore import SimpleDocumentStore
from llama_index.storage.index_store import SimpleIndexStore
from llama_index.vector_stores import SimpleVectorStore
from llama_index.node_parser import SimpleNodeParser
from llama_index import VectorStoreIndex, SimpleDirectoryReader, load_index_from_storage
from llama_index.storage.storage_context import StorageContext

'''
to run script: 
python /Users/omgitsmonday/projects/llm-prototypes/server/llm.py
'''

# api set up
# NOTE: for local testing only
os.environ['OPENAI_API_KEY'] = config.OPENAI_API_KEY # remove key when push to remote
openai.api_key = config.OPENAI_API_KEY 

# set up flask app
app = Flask(__name__)
CORS(app)

# set up pinecone vector store
import pinecone 
from langchain.vectorstores import Pinecone
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# initialize pinecone
pinecone.init(
    api_key=config.PINECONE_API_KEY,  # find at app.pinecone.io
    environment=config.PINECONE_ENVIRONMENT
)
# initialize pinecone index (treat as a table)
index_name = "llm-prototypes"
if index_name not in pinecone.list_indexes():
    # we create a new index
    pinecone.create_index(
        name=index_name,
        metric='cosine',
        dimension=1536  # 1536 dim of text-embedding-ada-002
    )
pinecone_index = pinecone.GRPCIndex(index_name)
print(pinecone_index.describe_index_stats())
pinecone.describe_index(index_name)

####################################### routes ########################################

@app.route("/query", methods=["POST"])
def query_agent():
    global agent
    request_data = request.get_json()
    query = request_data['question']
    if query is None:
        return "No text found:(", 400

    print("User query: " + query)
    docs = get_similar_docs(query)
    metadata = [doc.metadata for doc in docs]
    response = agent({"question":query}, return_only_outputs=True)
    print(response)
    res = {
        "answer": response['answer'],
        "sources": response['sources'],
        "id": [meta['id'] for meta in metadata],
        "label": [meta['label'] for meta in metadata],
        "description": [meta['description'] for meta in metadata],
        "date": [meta['date'] for meta in metadata]
    }
    return res, 200

@app.route("/upload/file", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return "Please send a POST request with a file", 400

    filepath = None
    try:
        uploaded_file = request.files["file"]
        print(uploaded_file)
        filename = uploaded_file.filename
        filepath = os.path.join('documents', os.path.basename(filename))
        uploaded_file.save(filepath)

        label = request.form.get("label", None)
        description = request.form.get("description", None)
        
        document = SimpleDirectoryReader(input_files=[filepath]).load_data()[0]
        source = label + '/' + document.extra_info['file_name']
        build_index([document], "./store", source, label, description)
    except Exception as e:
        print(e)
        # cleanup temp file
        if filepath is not None and os.path.exists(filepath):
            os.remove(filepath)
        return "Error: {}".format(str(e)), 500

    # cleanup temp file
    if filepath is not None and os.path.exists(filepath):
        os.remove(filepath)

    build_chain()
    return "File inserted!", 200

@app.route("/upload/wiki", methods=["POST"])
def upload_wiki():
    try:
        page_name = request.form.get('page_name', None)
        label = request.form.get("label", None)
        description = request.form.get("description", None)
        WikipediaReader = download_loader("WikipediaReader")
        source = 'https://en.wikipedia.org/wiki/'+page_name

        loader = WikipediaReader()
        print(page_name)
        document = loader.load_data(pages=[page_name])
        # print(document[0])
        build_index(document, './store', source, label, description)
    except Exception as e:
        print(e)
        return "Error: {}".format(str(e)), 500
    build_chain()
    return "File inserted!", 200

@app.route("/upload/url", methods=["POST"])
def upload_url():
    try:
        source = request.form.get('url', None)
        label = request.form.get("label", None)
        description = request.form.get("description", None)

        BeautifulSoupWebReader = download_loader("BeautifulSoupWebReader")
        loader = BeautifulSoupWebReader()
        documents = loader.load_data(urls=[source])

        build_index(documents, './store', source, label, description)
    except Exception as e:
        print(e)
        return "Error: {}".format(str(e)), 500
    build_chain()
    return "Url uploaded!", 200

@app.route("/get_files", methods=["POST"])
def retrieve_doc():
    from llama_index.vector_stores import PineconeVectorStore
    
    # label = request.form.get("label", "")
    # metadata_filters = {
    #     "label": label
    # }
    # vector_store = PineconeVectorStore(
    #     pinecone_index=pinecone_index,
    #     add_sparse_vector=True,
    #     metadata_filters=metadata_filters
    # )
    # storage_context = StorageContext.from_defaults(
    #     docstore=SimpleDocumentStore(),
    #     vector_store=vector_store,
    #     index_store=SimpleIndexStore(),
    # )
    # index = VectorStoreIndex([], storage_context=storage_context)

    # embeddings = OpenAIEmbeddings()
    # docsearch = Pinecone.from_existing_index(index_name, embeddings)
    # docs = docsearch.max_marginal_relevance_search(label, k=2, fetch_k=10)


##################################### index building ######################################
def initialize_index():
    ''' 
    use LlamaIndex as a query tool, augment the model with specific data
    '''
    return build_index([], "./store")
        
def build_index(documents, persist_dir, source="Uploaded file", label="General", description="Boston government document"):
    # pine cone store
    # text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    # docs = text_splitter.split_documents(documents)
    # embeddings = OpenAIEmbeddings()
    # docsearch = Pinecone.from_documents(docs, embeddings, index_name="llm-prototypes")

    # create storage context using default stores
    from llama_index.vector_stores import PineconeVectorStore
    import datetime

    # vector store in pinecone
    vector_store = PineconeVectorStore(
        pinecone_index=pinecone_index,
        add_sparse_vector=True,
    )
    storage_context = StorageContext.from_defaults(
        docstore=SimpleDocumentStore(),
        vector_store=vector_store,
        index_store=SimpleIndexStore(),
    )
    index = None  
    if (documents is not None):
        # create parser and parse document into nodes 
        parser = SimpleNodeParser()
        nodes = parser.get_nodes_from_documents(documents)
        for node in nodes:
            if (node.extra_info is None):
                node.extra_info = {}
            node.extra_info['source'] = source
            node.extra_info['label'] = label
            node.extra_info['description'] = description
            node.extra_info['date'] = str(datetime.date.today())

        # create (or load) docstore and add nodes
        # storage_context.docstore.add_documents(nodes)

        # build index
        index = VectorStoreIndex(nodes, storage_context=storage_context)
    else: 
        index = VectorStoreIndex([], storage_context=storage_context)

    # save index
    index.storage_context.persist(persist_dir=persist_dir)


##################################### tool building ######################################
def build_chain(): # https://python.langchain.com/en/latest/modules/agents/tools/custom_tools.html
    global agent

    # https://docs.pinecone.io/docs/langchain
    from langchain.embeddings.openai import OpenAIEmbeddings
    # create embedding
    model_name = 'text-embedding-ada-002'
    embed = OpenAIEmbeddings(
        model=model_name,
    )

    # vector store
    vectorstore = Pinecone(
        pinecone.Index("llm-prototypes"), 
        embed.embed_query, 
        "text"
    )
    
    from langchain.chains import RetrievalQAWithSourcesChain
    agent = RetrievalQAWithSourcesChain.from_chain_type(
        llm=build_llm(),
        chain_type="stuff",
        retriever=vectorstore.as_retriever()
    )

def get_similar_docs(query):
    embeddings = OpenAIEmbeddings()

    docsearch = Pinecone.from_existing_index(index_name, embeddings)

    docs = docsearch.similarity_search(query)
    return docs

def build_llm():
    return ChatOpenAI(
        model_name='gpt-3.5-turbo',
        temperature=0.0
    )

if __name__ == "__main__":
    build_index([], "./store")
    build_chain()
    app.run(host="0.0.0.0", port=5601)