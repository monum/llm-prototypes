# Boston LLM

Currently, the application only has a server side. It parses query from the url, and return a simple line of text as the output of the model. For now the GPT-3 model is extended with one pdf file - the <a href="https://www.bpl.org/wp-content/uploads/sites/30/2020/06/Meeting-Room-Use-Policy-FINAL-5.26.20.pdf">Boston Public Library meeting room policy </a> published by the Office of Exhibitions and Programs.

When the question is phrased in an ambiguous and vague way, the model gives answers based on the documents we gave it. As shown by the examples below, when the question does not specify what meeting rooms we are asking. The model assumes that we are in the context of the Boston Public Library meeting room policy, and gives an answer based on the pdf.

<img src="./client/public/meeting rooms.png">
<img src="./client/public/meeting rooms at BPL.png">

However, this may create ambiguity when more documents were to be introduced. As shown by the example below, if the Boston Public Library policy file has a higher priority in the file hierarchy than the Boston geographic data when we index the documents, then the model might give the wrong answer.

<img src="./client/public/where is Boston.png">

Notice also that the first part of the response tries to complete the query and is not a full sentence. This might be a potential issue down the line.