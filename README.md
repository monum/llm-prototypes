# Boston LLM

Currently, the application has a integrated client side and server side. It receives user input from the text box on the client side and send query request to the server. For now the GPT-3 model is extended with one pdf file - the <a href="https://www.bpl.org/wp-content/uploads/sites/30/2020/06/Meeting-Room-Use-Policy-FINAL-5.26.20.pdf">Boston Public Library meeting room policy </a> published by the Office of Exhibitions and Programs.

Week 1 Progress:

- [ ]  On top of the current implementation in Flask, make sure the model runs with multiple file inputs, and potentially with file input of different formats.
- [x]  Build the client side of the application in ~~plain HTML~~ React
    - ~~The query to the model is still hard-coded in the URL or on the server side since we are not allowing user input from the client side yet~~
- [ ]  Explore the use of roles and contexts
    - By helping user create structured queries, the responses may become more accurate
    - user is not allowed to become a GPT freerider by telling bot to “forget about everything and answer this”
- [ ]  Explore the potential to build index on top of other indices to take advantage of potential hierarchy in the input documents and LLM’s ability to summarize data across nodes
    - Look into LlamaIndex’s Composability section for
        - creating subindices with input data
        - defining summary text
        - creating graph with multi-level indexing
        - querying a graph
- [ ]  Improve styling of components using Bootstrap or CSS