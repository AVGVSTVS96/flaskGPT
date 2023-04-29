import os
from dotenv import load_dotenv
import json  
from flask import Flask, render_template, request, jsonify  
import openai  
from openai.error import RateLimitError  
from ast import literal_eval

load_dotenv()
  
app = Flask(__name__)  
openai.api_key = os.getenv("OPENAI_API_KEY")  
  
@app.route('/')  
def index():  
    return render_template('index.html')  
  
@app.route('/gpt4', methods=['GET', 'POST'])  
def gpt4():
    user_input = request.args.get('user_input') if request.method == 'GET' else request.form['user_input']
    messages = literal_eval(request.form['messages'])  # parse the messages list from the request
    messages.append({"role": "user", "content": user_input})  # add the current user message to the messages list

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )
        content = response.choices[0].message["content"]
    except RateLimitError:
        content = "The server is experiencing a high volume of requests. Please try again later."

    return jsonify(content=content)
  
if __name__ == '__main__':  
    app.run(debug=True)