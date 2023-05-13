import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, Response
import openai
from openai.error import RateLimitError

load_dotenv()

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route('/')
def index():
    return render_template('index.html')


def generate(messages, model_type):
    def stream():
        try:
            response = openai.ChatCompletion.create(
                model=model_type,
                messages=messages,
                stream=True
            )

            for chunk in response:
                content = chunk['choices'][0]['delta'].get('content', '')
                if content:
                    yield content

        except RateLimitError:
            yield "The server is experiencing a high volume of requests. Please try again later."

    return stream()


@app.route('/gpt4', methods=['POST'])
def gpt4():
    data = request.get_json()
    user_input = data.get('user_input')
    messages = data.get('messages', [])
    system_message = data.get('system_message')
    model_type = data.get('model_type', "gpt-3.5-turbo")

    messages = [{"role": "system", "content": system_message}] + messages
    assistant_response = generate(messages, model_type)
    return Response(assistant_response, mimetype='text/event-stream')


if __name__ == '__main__':
    app.run(debug=True)
