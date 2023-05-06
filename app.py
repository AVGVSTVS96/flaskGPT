import os
import json
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


def generate(messages):
    def stream():
        assistant_response = []

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                stream=True
            )

            for chunk in response:
                content = chunk['choices'][0]['delta'].get('content', '')
                if content:
                    yield f'data: {content}\n\n'
                    assistant_response.append({"content": content})

        except RateLimitError:
            assistant_response.append(
                {"content": "The server is experiencing a high volume of requests. Please try again later."})
            yield f'data: {assistant_response[-1]["content"]}\n\n'

        yield 'data: [DONE]\n\n'

    return stream()


@app.route('/gpt4', methods=['GET'])
def gpt4():
    user_input = request.args.get('user_input')
    messages = json.loads(request.args.get('messages', '[]'))
    messages = [{"role": "system",
                 "content": "respond with only two words and two emojis"}] + messages
    messages.append({"role": "user", "content": user_input})

    assistant_response = generate(messages)
    return Response(assistant_response, mimetype='text/event-stream')


if __name__ == '__main__':
    app.run(debug=True)
