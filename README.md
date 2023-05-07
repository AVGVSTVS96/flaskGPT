# flaskGPT

flaskGPT is a GPT-3.5/4 web app build with Flask and OpenAI's API.

This branch makes several changes to switch from the URL query parameter
method in the URLstreaming branch to the new method that uses Server-Sent Events (SSE)
with POST requests:

1. Modify Flask route for /gpt4 endpoint to accept POST requests:

2. Update receiving user input and message history in app.py:
   - Replace request.args.get() with request.json.get() in gpt4() function.

3. Update sending user input and message history in main.js:
   - Replace GET request with a fetch() POST request containing a JSON object
     in the request body.

4. Implement SSE for streaming GPT model output:
   - Remove formatting of SSE in generate() function
   - Wrap the generated response in an app.response_class() call to create a
     Flask Response object with the appropriate SSE content type.

5. Update JavaScript code to handle streaming responses:
   - Replace EventSource with a fetch() POST request in main.js.
   - Read the response stream using response.body.getReader().
   - Modify the response handling function to process incoming chunks of the GPT
     model's response.
   - Extract the actual content from the response data string.

These changes transition the project from the urlstreaming method to the more
efficient and secure streamingSSE method for sending user input and message
history to the server and receiving the GPT model's output.


## **Issues**
- [ ] Fix chat-container scrolling

### **UI**
- [ ] Add ability for users to edit system message from UI
- [ ] Add the ability to switch between GPT-3.5 and GPT-4

### **Logic**
- [ ] Add ability to save and revisit chats
- [ ] Figure out how to get embeddings from recursively scraped websites, PDFs, and git repos 

### **Completed**
- [x] Correctly implement character streaming functionality
- [x] Add system role to steer AI behavior 
- [x] Separate HTML, CSS and JS into their own files
- [x] Style the UI with CSS
- [x] Move chat input to the bottom of the chatbox
