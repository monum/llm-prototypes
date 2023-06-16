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
  query_text = request_data['question']
  if query_text is None:
    return "No text found:(", 400

  print("User query: " + query_text)
  response = agent.run(input=query_text)
  return response, 200

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
        index = get_index([document], "./store", source, label, description)
        build_agent(index)
    except Exception as e:
        print(e)
        # cleanup temp file
        if filepath is not None and os.path.exists(filepath):
            os.remove(filepath)
        return "Error: {}".format(str(e)), 500

    # cleanup temp file
    if filepath is not None and os.path.exists(filepath):
        os.remove(filepath)

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
        index = get_index(document, './store', source, label, description)
        build_agent(index)
    except Exception as e:
        print(e)
        return "Error: {}".format(str(e)), 500

    return "File inserted!", 200

# @app.route("/get_files", methods=["GET"])
# def retrieve_doc():
#     # initialize pinecone
#     pinecone.init(
#         api_key=PINECONE_API_KEY,  # find at app.pinecone.io
#         environment=PINECONE_ENV  # next to api key in console
#     )
#     index_name = "langchain-demo"
#     embeddings = OpenAIEmbeddings()
#     docsearch = Pinecone.from_documents(docs, embeddings, index_name=index_name)

#     # if you already have an index, you can load it like this
#     # docsearch = Pinecone.from_existing_index(index_name, embeddings)

#     query = "What did the president say about Ketanji Brown Jackson"
#     docs = docsearch.similarity_search(query)


##################################### index building ######################################

def initialize_llama_index():
    ''' 
    use LlamaIndex as a query tool, augment the model with specific data
    '''
    # path = os.path.join(os.getcwd(), './store')
    # if os.path.exists(path):
    #     return get_index([], "./store")
    # else :
    #     print("build index from local files")
        # document_ids = ['13CJ05ef5AvSQjWmkBAPCWMMjJTYm-qWwVeIkmLtcK64']
        # google_doc = GoogleDocsReader().load_data(document_ids=document_ids)
        # index = GPTSimpleVectorIndex.from_documents(google_doc)
        # wikipedia
        # WikipediaReader = download_loader("WikipediaReader")

        # documents.extend(WikipediaReader().load_data(pages=['Boston']))
        
        # documents = SimpleDirectoryReader("./documents").load_data()
        # documents.extend(SimpleDirectoryReader("./add_docs").load_data())

    return get_index([], "./store")
        

def get_index(documents, persist_dir, source="Uploaded file", label="General", description="Boston government document"):
    # pine cone store
    # text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    # docs = text_splitter.split_documents(documents)
    # embeddings = OpenAIEmbeddings()
    # docsearch = Pinecone.from_documents(docs, embeddings, index_name="llm-prototypes")

    # create storage context using default stores
    from llama_index.vector_stores import PineconeVectorStore

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
            print(node)
            print(node.extra_info)
            if (node.extra_info is None):
                node.extra_info = {}
            node.extra_info['source'] = source
            node.extra_info['label'] = label
            node.extra_info['description'] = description

        # create (or load) docstore and add nodes
        # storage_context.docstore.add_documents(nodes)

        # build index
        index = VectorStoreIndex(nodes, storage_context=storage_context)
    else: 
        index = VectorStoreIndex([], storage_context=storage_context)

    # save index
    index.storage_context.persist(persist_dir=persist_dir)

    return index

##################################### tool building ######################################
def build_pinecone_retrieval_tool(): # https://python.langchain.com/en/latest/modules/agents/tools/custom_tools.html
    # https://docs.pinecone.io/docs/langchain
    from langchain.embeddings.openai import OpenAIEmbeddings

    # create embedding
    model_name = 'text-embedding-ada-002'
    embed = OpenAIEmbeddings(
        model=model_name,
    )
    # vector store
    text_field = "text"
    vectorstore = Pinecone(
        pinecone.Index("llm-prototypes"), 
        embed.embed_query, 
        text_field
    )
    
    from langchain.chains import RetrievalQA

    # completion llm
    llm = ChatOpenAI(
        model_name='gpt-3.5-turbo',
        temperature=0.0
    )

    from langchain.chains import RetrievalQAWithSourcesChain

    qa = RetrievalQAWithSourcesChain.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever()
    )

    # qa = RetrievalQA.from_chain_type(
    #     llm=llm,
    #     chain_type="stuff",
    #     retriever=vectorstore.as_retriever(),
    #     return_source_documents=True
    # )
    from langchain.tools import tool
    @tool("retrieval", return_direct=True)
    def retrieval(query: str) -> str:
        """useful for useful for when you want to answer queries that might be answered by the Boston government, or about Fresh Start, and when you are asked to include evidence of original source file or text and where you find certain information"""
        response = qa({"question":query}, return_only_outputs=True)
        # return f"{response['result']} \nSrouce: {response['source_documents'][0]}"
        return f"{response['answer']} \n Source: {response['sources']}"

    return retrieval


def build_llama_tool(index):
    query_engine = index.as_query_engine()
    tool_config = IndexToolConfig(
        query_engine=query_engine, 
        name="Llama",
        description=f"useful for when you want to answer queries that might be answered by the Boston government, or about Fresh Start",
        tool_kwargs={"return_direct": True}
    )
    return LlamaIndexTool.from_tool_config(tool_config)

def build_web_search_tool():
    from langchain import SerpAPIWrapper
    search = SerpAPIWrapper(serpapi_api_key=config.SERPAPI_API_KEY)
    return Tool(
        name = "Search",
        func=search.run,
        description="useful for when you need to answer questions about general knowledge, things that might be on the news, common sense knowledge"
    )

def build_GPT_tool():
    from langchain.tools import AIPluginTool
    return AIPluginTool.from_plugin_url("https://www.klarna.com/.well-known/ai-plugin.json")

def build_llm():
    return ChatOpenAI(temperature=0)

##################################### agent building ######################################

def build_agent(index):
    '''
    create tools and build toolkit, then create an agent
    '''
    global agent
    # from langchain.agents import AgentType
    
    toolkit = [build_pinecone_retrieval_tool(), build_web_search_tool(), build_GPT_tool()] # build_llama_tool(index)

    agent = initialize_agent(
        agent="conversational-react-description",
        tools=toolkit,
        llm=build_llm(),
        memory=ConversationBufferMemory(memory_key="chat_history"),
        verbose=True,
        handle_parsing_errors='Check your output and make sure it conforms! If you think you do not need any tool, just return your thought.'
    )


if __name__ == "__main__":
    index = initialize_llama_index()
    build_agent(index)
    app.run(host="0.0.0.0", port=5601)