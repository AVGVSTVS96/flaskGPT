# flaskGPT

flaskGPT is a GPT-3.5/4 web app build with Flask and OpenAI's API.

It will be a customizable platform with a tutor mode that helps users solve problems without giving them the solutions. Instead flaskGPT will provide hints and education in the topics needed for the user to figure out the problems on their own.

flaskGPT will be careful to not divulge the solution accidentally, and will be toughtful with hints and relevant education.
flaskGPT will eventually be able to use your own documentation from files or websites as context to better help users with whatever they want. A fully customimzable system message further enables users to modify their experience however they choose.


## **Issues**
- [ ] Fix chat-container responsiveness 
- [ ] Correctly implement character streaming functionality
## **Roadmap**
### **UI**
- [x] Style the UI with CSS
- [x] Move chat input to the bottom of the chatbox
- [ ] Add ability for users to edit system message from UI
- [ ] Add the ability to switch between GPT-3.5 and GPT-4

### **Logic**
- [x] Add system role to steer AI behavior 
- [ ] Create tutorGPT prompt
- [ ] Add ability to save and revisit chats 
- [ ] Separate HTML, CSS and JS into their own files
- [ ] Figure out how to get embeddings from recursively scraped websites, PDFs, and git repos 

