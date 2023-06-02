from flask import Flask
import os
from llama_index import SimpleDirectoryReader, GPTSimpleVectorIndex, GoogleDocsReader
from flask import request
from flask_cors import CORS
import config

# to run script: python /Users/omgitsmonday/llm/llm-server/llm.py

# NOTE: for local testing only
os.environ['OPENAI_API_KEY'] = config.OPENAI_API_KEY # remove key when push to remote
index = None
index_name = "indices"
app = Flask(__name__)
CORS(app)

@app.route("/query", methods=["POST"])
def query_index():
  global index
  request_data = request.get_json()
  query_text = request_data['question']
  if query_text is None:
    return "No text found:(", 400
  response = index.query(query_text)
  return str(response), 200

@app.route("/")
def home():
    return "Ask a question!"

def initialize_index():
    ''' 
    augment the model with specific data
    '''
    global index
    if os.path.exists(index_name):
        index = GPTSimpleVectorIndex.load_from_disk(index_name)
    # if no index file, we index all documents
    else:
        # document_ids = ['13CJ05ef5AvSQjWmkBAPCWMMjJTYm-qWwVeIkmLtcK64']
        # google_doc = GoogleDocsReader().load_data(document_ids=document_ids)
        # index = GPTSimpleVectorIndex.from_documents(google_doc)
        
        # directory files
        documents = SimpleDirectoryReader("./documents").load_data()
        documents.extend(SimpleDirectoryReader("./add_docs").load_data())
        index = GPTSimpleVectorIndex.from_documents(documents)
        index.save_to_disk(index_name)

if __name__ == "__main__":
    initialize_index()
    app.run(host="0.0.0.0", port=5601)