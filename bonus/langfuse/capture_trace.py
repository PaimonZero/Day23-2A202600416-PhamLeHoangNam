import os
from langfuse.langchain import CallbackHandler
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage

# Mock environment variables for self-hosted Langfuse
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-lf-..." # Not actually used in self-hosted without auth, but good practice
os.environ["LANGFUSE_SECRET_KEY"] = "sk-lf-..."
os.environ["LANGFUSE_HOST"] = "http://localhost:3030"

# Initialize handler
langfuse_handler = CallbackHandler()

# Mock ChatOpenAI to avoid needing a real key for the demo
class MockChatOpenAI(ChatOpenAI):
    def _generate(self, *args, **kwargs):
        from langchain.schema import ChatResult, ChatGeneration, AICmessage
        return ChatResult(generations=[ChatGeneration(message=AICmessage(content="Hello! I am a mock AI."))])

# In a real scenario, you'd use a real API key
# llm = ChatOpenAI(openai_api_key="sk-...")
llm = MockChatOpenAI(openai_api_key="mock")

def main():
    print("Sending trace to Langfuse...")
    try:
        response = llm.invoke([HumanMessage(content="What is observability?")], config={"callbacks": [langfuse_handler]})
        print(f"Response: {response.content}")
        langfuse_handler.flush()
        print("Trace sent successfully.")
    except Exception as e:
        print(f"Failed to send trace: {e}")

if __name__ == "__main__":
    main()
