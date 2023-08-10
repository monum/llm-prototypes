import os  
import json  
import datetime
import re
import openai  
from flask import Flask
from flask import request
from flask_cors import CORS

from langchain.text_splitter import CharacterTextSplitter
from llama_index import SimpleDirectoryReader
from langchain.vectorstores.azuresearch import AzureSearch
from langchain.embeddings import OpenAIEmbeddings
from llama_index.storage.storage_context import StorageContext
from llama_index import VectorStoreIndex
from llama_index import Document
from azure.storage.blob import BlobServiceClient

# from tenacity import retry, wait_random_exponential, stop_after_attempt  
from azure.core.credentials import AzureKeyCredential  
from azure.search.documents import SearchClient  
from azure.search.documents.indexes import SearchIndexClient  
from azure.search.documents.models import Vector  
from azure.search.documents.indexes.models import (  
    SearchIndex,  
    SearchField,  
    SearchFieldDataType,  
    SimpleField,  
    SearchableField,  
    SearchIndex,  
    SemanticConfiguration,  
    PrioritizedFields,  
    SemanticField,  
    SearchField,  
    SemanticSettings,  
    VectorSearch,  
    VectorSearchAlgorithmConfiguration,  
)  
import config

########################### Set up ############################
# Set up azure cognitive search
service_endpoint = config.AZURE_SEARCH_ENDPOINT
index_name = "azure-search"
key = config.AZURE_SEARCH_ADMIN_KEY

# Set up OpenAI
os.environ['OPENAI_API_KEY'] = config.OPENAI_API_KEY # remove key when push to remote
openai.api_key = config.OPENAI_API_KEY 
model: str = "text-embedding-ada-002"

# Set up flask app
app = Flask(__name__)
CORS(app)

########################### Flask App Routes ############################
@app.route("/query", methods=["POST"])
def query():
    request_data = request.get_json()
    query = request_data['question']
    if query is None:
        return "No text found:(", 400
    print("User query: " + query)

    # Source file retrieval
    search_client = SearchClient(service_endpoint, index_name, credential=AzureKeyCredential(key))
    # vector = Vector(value=generate_embeddings(query), k=3, fields="contentVector")
    results = search_client.search(  
        search_text=query,  
        select=["department", "organization", "filename", "date", "content", "url"],
    )
    # for result in results:
    #     print(result)
    
    # {'date': '2023-08-09', 'department': '', 'filename': 'Fresh Start.pdf', 'organization': '', '@search.score': 1.9620056, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}

    # LLM response
    # construct documents from source files
    docs = []
    sources = []
    for result in results:
        doc = Document(
            text=result["content"]
        )
        doc.metadata = {
            "department": result["department"],
            "organization":result["organization"],
            "filename": result["filename"],
            "date": result["date"]
        }
        source = {
            "department": result["department"],
            "organization":result["organization"],
            "filename": result["filename"],
            "url": result["url"],
            "date": result["date"],
            "content": result["content"]
        }
        docs.append(doc)
        sources.append(source)
    
    index = VectorStoreIndex.from_documents(docs)
    query_engine = index.as_query_engine()
    res = query_engine.query(query)
    try:
        response = {
            "answer": res.response,
            "confidence": "",
            "sources": sources
        }
        print(response)
    except Exception as e:
        print(e)
        return "Error: {}".format(str(e)), 500

    return response, 200

@app.route("/upload/file", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return "Please send a POST request with a file", 400
    # Read file to local directory 
    # [ISSUE] IO reduces efficiency
    filepath = None
    try:
        new_file = request.files["file"]
        print(new_file)
        filename = new_file.filename
        filepath = os.path.join('documents', os.path.basename(filename))
        new_file.save(filepath)
        document = SimpleDirectoryReader(input_files=[filepath]).load_data()[0]
    except Exception as e:
        print(e)
        if filepath is not None and os.path.exists(filepath):
            os.remove(filepath)
        return "Error: {}".format(str(e)), 500
    
    # Store in blob storage
    try:
        blob_service_client = BlobServiceClient.from_connection_string(config.AZURE_STORAGE_ACCESS_KEY)
        blob_client = blob_service_client.get_blob_client(container=request.form.get("label", None).lower(), blob=document.extra_info['file_name'])
        print("\nUploading to Azure Storage as blob:\n\t" + document.extra_info['file_name'])
        with open(file=filepath, mode="rb") as data:
            blob_client.upload_blob(data)
        url = blob_client.url
    except Exception as e: # if file already exists, ask if continue to upload
        if e.error_code == "BlobAlreadyExists":
            print("Blob already exists!")
            return "Blob already Exists!", 409
        return "Error: {}".format(str(e)), 500
    
    # Store in search index
    try:
        description = request.form.get("description", None)
        file_name = document.extra_info['file_name']
        department = request.form.get("label", None)
        org = request.form.get("org", None)
        content_text = document.text
        search_index_entry = {
            "id": document.doc_id,
            "description": description,
            "content": content_text,
            "department": department,
            "organization": org,
            "filename": file_name,
            "url": url,
            "date": str(datetime.date.today()),
            "description_vector": generate_embeddings(description),
            "content_vector": generate_embeddings(content_text)
        }
        search_client = SearchClient(endpoint=service_endpoint, index_name=index_name, credential=AzureKeyCredential(key))
        result = search_client.merge_or_upload_documents(documents = [search_index_entry])  
        print("Upload of new document succeeded: {}".format(result[0].succeeded))
    except Exception as e:
        print(e)
        if filepath is not None and os.path.exists(filepath):
            os.remove(filepath)
        return "Error: {}".format(str(e)), 500
    
    os.remove(filepath)
    return "File uploaded!", 200

########################### Embeddings & Indexing #########################
def generate_embeddings(text):
    '''
    Generate embeddings from text string
    input: text string to be embedded
    output: text embeddings
    '''
    response = openai.Embedding.create(
        input=text, engine="text-embedding-ada-002")
    embeddings = response['data'][0]['embedding']
    return embeddings

def create_search_index(index_client):
    '''
    Create a search index if does not exist
    '''
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True, sortable=True, filterable=True, facetable=True),
        SearchableField(name="description", type=SearchFieldDataType.String),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SearchableField(name="department", type=SearchFieldDataType.String, filterable=True),
        SearchableField(name="organization", type=SearchFieldDataType.String, filterable=True),
        SearchableField(name="filename", type=SearchFieldDataType.String, filterable=True, searchable=True),
        SearchableField(name="url", type=SearchFieldDataType.String, filterable=True),
        SearchableField(name="date", type=SearchFieldDataType.String, filterable=True),
        SearchField(name="description_vector", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                    searchable=True, dimensions=1536, vector_search_configuration="my-vector-config"),
        SearchField(name="content_vector", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                    searchable=True, dimensions=1536, vector_search_configuration="my-vector-config"),
    ]
    vector_search = VectorSearch(
        algorithm_configurations=[
            VectorSearchAlgorithmConfiguration(
                name="my-vector-config",
                kind="hnsw",
                parameters={
                    "m": 4,
                    "efConstruction": 400,
                    "efSearch": 500,
                    "metric": "cosine"
                }
            )
        ]
    )
    # Create the search index with the semantic settings
    index = SearchIndex(name=index_name, fields=fields, vector_search=vector_search)
    result = index_client.create_or_update_index(index)
    print(f' {result.name} created')

def search_index_exist(index_client):
    index_names = index_client.list_index_names()
    for name in index_names:
        if name == index_name:
            return True
    return False

if __name__ == "__main__":
    index_client = SearchIndexClient(
        endpoint=service_endpoint, 
        credential=AzureKeyCredential(key)
    )
    # if does not exist vector store, create one
    if (not search_index_exist(index_client)): 
        print(index_name, " does not exist, creating new search index...")
        create_search_index(index_client)

    app.run(host="0.0.0.0", port=5601)