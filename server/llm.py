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
# import pinecone

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

# to run script: python /Users/omgitsmonday/projects/llm-prototypes/server/llm.py

# NOTE: for local testing only
os.environ['OPENAI_API_KEY'] = config.OPENAI_API_KEY # remove key when push to remote
openai.api_key = config.OPENAI_API_KEY 
index = None
index_name = "indices"
app = Flask(__name__)
CORS(app)

@app.route("/query", methods=["POST"])
def query_agent():
  # global index
  global agent
  request_data = request.get_json()
  query_text = request_data['question']
  if query_text is None:
    return "No text found:(", 400
  # response = index.query(query_text)
  # return str(response), 200
  print(query_text)
  response = agent.run(input=query_text)
  print(response)
  return response, 200

@app.route("/upload", methods=["POST"])
def upload_file():
    # global manager
    if 'file' not in request.files:
        return "Please send a POST request with a file", 400

    filepath = None
    try:
        uploaded_file = request.files["file"]
        print(uploaded_file)
        filename = uploaded_file.filename
        filepath = os.path.join('documents', os.path.basename(filename))
        uploaded_file.save(filepath)

        if request.form.get("filename_as_doc_id", None) is not None:
            insert_into_index(filepath, doc_id=filename)
        else:
            insert_into_index(filepath)
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

# @app.route("/feedback", methods=["POST"])
# def submit_feedback():
#     request_data = request.get_json()
#     temp = {
        
#     }
    

# helper methods

def initialize_agent():
    ''' 
    use LlamaIndex as a query tool, augment the model with specific data
    '''
    # global index
    try:
        # this will loaded the persisted stores from persist_dir
        storage_context = StorageContext.from_defaults(
            persist_dir="./store"
        )
        # then load the index object
        index = load_index_from_storage(storage_context)
        print('success')
    # if no index file, we index all documents
    except:
        # document_ids = ['13CJ05ef5AvSQjWmkBAPCWMMjJTYm-qWwVeIkmLtcK64']
        # google_doc = GoogleDocsReader().load_data(document_ids=document_ids)
        # index = GPTSimpleVectorIndex.from_documents(google_doc)
        

        # directory files
        documents = SimpleDirectoryReader("./documents").load_data()
        # documents.extend(SimpleDirectoryReader("./add_docs").load_data())


        # create storage context using default stores
        storage_context = StorageContext.from_defaults(
            docstore=SimpleDocumentStore(),
            vector_store=SimpleVectorStore(),
            index_store=SimpleIndexStore(),
        )

        # create parser and parse document into nodes 
        parser = SimpleNodeParser()
        nodes = parser.get_nodes_from_documents(documents)

        # create (or load) docstore and add nodes
        storage_context.docstore.add_documents(nodes)

        # wikipedia
        # WikipediaReader = download_loader("WikipediaReader")
        # documents.extend(WikipediaReader().load_data(pages=['Boston']))

        # split documents into chunks
        # text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=50)
        # docs = text_splitter.split_documents(documents)

        # build index
        index = VectorStoreIndex(nodes, storage_context=storage_context)
        # save index
        index.storage_context.persist(persist_dir="./store")
    build_agent(index)
    return

def build_agent(index):
    global agent
    query_engine = index.as_query_engine()

    tool_config = IndexToolConfig(
        query_engine=query_engine, 
        name="Llama",
        description=f"useful for when you want to answer queries that might be answered by the Boston government, or about Fresh Start",
        tool_kwargs={"return_direct": True}
    )
    llama_tool = LlamaIndexTool.from_tool_config(tool_config)
    
    # web search tool
    from langchain import SerpAPIWrapper
    search = SerpAPIWrapper(serpapi_api_key=config.SERPAPI_API_KEY)
    search_tool = Tool(
            name = "Search",
            func=search.run,
            description="useful for when you need to answer questions about general knowledge, things that might be on the news, common sense knowledge"
        )
    
    # ChatGPT tool
    from langchain.tools import AIPluginTool
    gpt_tool = AIPluginTool.from_plugin_url("https://www.klarna.com/.well-known/ai-plugin.json")

    toolkit = [llama_tool, search_tool, gpt_tool]

    # IndexToolConfig(
    #     query_engine=graph_query_engine,
    #     name=f"Graph Index",
    #     description="useful for when you want to answer queries that require analyzing multiple SEC 10-K documents for Uber.",
    #     tool_kwargs={"return_direct": True}
    # )

    # set Logging to DEBUG for more detailed outputs
    memory = ConversationBufferMemory(memory_key="chat_history")
    llm = ChatOpenAI(temperature=0)
    
    agent_cls = AGENT_TO_CLASS["conversational-react-description"]
    agent_obj = agent_cls.from_llm_and_tools(llm, toolkit)
    agent = AgentExecutor.from_agent_and_tools(
        agent=agent_obj,
        tools=toolkit,
        memory=memory,
        verbose=True,
        handle_parsing_errors="Check your output and make sure it conforms! If you think you do not need any tool, just return your thought."
    )
    # agent = create_llama_chat_agent(
    #     toolkit,
    #     llm,
    #     memory=memory,
    #     verbose=True
    # )
    return


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

def insert_into_index(doc_text, doc_id=None):
    ''' 
    insert file uploaded to index
    '''
    print(doc_text)
    document = SimpleDirectoryReader(input_files=[doc_text]).load_data()[0]
    if doc_id is not None:
        document.doc_id = doc_id

    # index.insert(document)
    # index.storage_context.persist()

    # this will loaded the persisted stores from persist_dir
    storage_context = StorageContext.from_defaults(
        persist_dir="./store"
    )
    # create parser and parse document into nodes 
    parser = SimpleNodeParser()
    nodes = parser.get_nodes_from_documents([document])

    # build index
    storage_context.docstore.add_documents(nodes)
    index = VectorStoreIndex(nodes, storage_context=storage_context)
    # save index
    index.storage_context.persist(persist_dir="./store")
    

    # import pinecone
    # from llama_index.vector_stores import PineconeVectorStore
    # api_key = 
    # pinecone.init(api_key=api_key, environment="us-west1-gcp")
    build_agent(index)




if __name__ == "__main__":
    initialize_agent()
    app.run(host="0.0.0.0", port=5601)