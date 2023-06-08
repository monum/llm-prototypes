from flask import Flask
import os
from llama_index import SimpleDirectoryReader, GPTSimpleVectorIndex, GoogleDocsReader, download_loader
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
        # documents.extend(SimpleDirectoryReader("./add_docs").load_data())

        # wikipedia
        # WikipediaReader = download_loader("WikipediaReader")
        # documents.extend(WikipediaReader().load_data(pages=['Boston']))

        

        # create indices
        index = GPTSimpleVectorIndex.from_documents(documents)
        index.save_to_disk(index_name)


def insert_into_index(doc_text, doc_id=None):
    ''' 
    insert file uploaded to index
    '''
    print(doc_text)
    document = SimpleDirectoryReader(input_files=[doc_text]).load_data()[0]
    if doc_id is not None:
        document.doc_id = doc_id
    print(document)
    index.insert(document)
    # index.storage_context.persist()


if __name__ == "__main__":
    initialize_index()
    app.run(host="0.0.0.0", port=5601)