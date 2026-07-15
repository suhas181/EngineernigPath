export interface AIEngineerMonth {
  number: number;
  title: string;
  focus: string;
  topics: string[];
  tools: string[];
  youtube: {
    channel: string;
    bestFor: string;
    searchUrl: string;
  }[];
  project: {
    title: string;
    description: string;
  };
}

export const aiEngineerRoadmap: AIEngineerMonth[] = [
  {
    number: 1,
    title: "Python, Math & Developer Foundations",
    focus: "Python + Math/Stats foundations + Git",
    topics: [
      "Core Python: Data types, functions, OOP, list/dict comprehensions",
      "Git & GitHub: Commits, branching, pull requests, version control",
      "Developer basics: Command line, virtual environments (venv/pip/conda)",
      "Math for AI: Linear algebra (vectors, matrices, dot products)",
      "Calculus & Stats: Derivatives, gradients, distributions, Bayes' theorem",
      "Data Handling: NumPy for matrix ops, Pandas for cleaning, Matplotlib for charts"
    ],
    tools: ["Python 3.11+", "VS Code / PyCharm", "Git & GitHub", "Jupyter Notebook", "pip / venv / conda"],
    youtube: [
      {
        channel: "freeCodeCamp",
        bestFor: "Full-length free Python and math-for-ML courses",
        searchUrl: "https://www.youtube.com/@freecodecamp/search?query=python+math"
      },
      {
        channel: "Corey Schafer",
        bestFor: "Clear, well-paced core Python and OOP tutorials",
        searchUrl: "https://www.youtube.com/@coreyms/search?query=python"
      },
      {
        channel: "3Blue1Brown",
        bestFor: "Outstanding visual intuition for linear algebra and calculus",
        searchUrl: "https://www.youtube.com/@3blue1brown/playlists"
      },
      {
        channel: "StatQuest with Josh Starmer",
        bestFor: "Best plain-English explanations of statistics",
        searchUrl: "https://www.youtube.com/@statquest/search?query=statistics"
      }
    ],
    project: {
      title: "Data-cleaning & Visualization Pipeline",
      description: "Build a script to clean a public Kaggle dataset, calculate summary statistics, and generate standard distribution plots. Document it with a proper README and commit to GitHub."
    }
  },
  {
    number: 2,
    title: "Machine Learning Fundamentals",
    focus: "Understand classic ML, train, evaluate, and tune models",
    topics: [
      "Supervised learning: Linear/logistic regression, decision trees, random forests",
      "Advanced ML: Gradient boosting (XGBoost, LightGBM) for tabular data",
      "Unsupervised learning: K-Means clustering, PCA for dimensionality reduction",
      "Evaluation metrics: Train/test split, cross-validation, precision/recall/F1, RMSE/MAE",
      "Data engineering: Feature engineering, scaling, handling missing values",
      "Model tuning: Overfitting, regularization (L1/L2), hyperparameter tuning"
    ],
    tools: ["scikit-learn", "XGBoost", "LightGBM", "Pandas Profiling / ydata-profiling", "Kaggle API"],
    youtube: [
      {
        channel: "StatQuest with Josh Starmer",
        bestFor: "Algorithm-by-algorithm visual explanations (Regression, Trees, XGBoost)",
        searchUrl: "https://www.youtube.com/@statquest/search?query=machine+learning"
      },
      {
        channel: "Krish Naik",
        bestFor: "Practical, project-heavy classic machine learning pipelines",
        searchUrl: "https://www.youtube.com/@krishnaik06/search?query=machine+learning"
      },
      {
        channel: "CampusX",
        bestFor: "Structured machine learning playlists and coding assignments",
        searchUrl: "https://www.youtube.com/@campusx-official/search?query=machine+learning"
      }
    ],
    project: {
      title: "House Price Predictor & Customer Churn Classifier",
      description: "Build a complete classic ML pipeline: load and preprocess dataset, perform feature engineering, train an XGBoost model, perform hyperparameter tuning, and evaluate using a confusion matrix."
    }
  },
  {
    number: 3,
    title: "Deep Learning & NLP Basics",
    focus: "Neural networks from scratch to PyTorch, and NLP foundations",
    topics: [
      "Neural net fundamentals: Forward/backward propagation, activation functions, loss functions, SGD/Adam optimizers",
      "History: CNNs (images) and RNNs/LSTMs (sequences) and why Transformers replaced them",
      "Transformer architecture: Self-attention mechanism, encoders, decoders",
      "NLP prep: Tokenization, word embeddings (word2vec), text vectorization",
      "Hugging Face: Accessing models on Hub, fine-tuning basics"
    ],
    tools: ["PyTorch", "Hugging Face Transformers", "Hugging Face Hub", "Google Colab / Kaggle GPU"],
    youtube: [
      {
        channel: "Andrej Karpathy",
        bestFor: "Zero to Hero neural networks, building GPT from scratch in code",
        searchUrl: "https://www.youtube.com/@AndrejKarpathy/search?query=neural+networks"
      },
      {
        channel: "sentdex",
        bestFor: "Hands-on, code-heavy deep learning and PyTorch tutorials",
        searchUrl: "https://www.youtube.com/@sentdex/search?query=pytorch"
      },
      {
        channel: "freeCodeCamp",
        bestFor: "Full deep learning and PyTorch course-length videos",
        searchUrl: "https://www.youtube.com/@freecodecamp/search?query=pytorch"
      }
    ],
    project: {
      title: "PyTorch Neural Net & Hugging Face Text Classifier",
      description: "Implement a basic neural network from scratch using NumPy, rebuild it using PyTorch, then use Hugging Face `transformers` to build a sentiment analyzer on a text dataset."
    }
  },
  {
    number: 4,
    title: "LLMs, Prompt Engineering & GenAI APIs",
    focus: "Build programmatic applications on top of modern LLM APIs",
    topics: [
      "LLM internals: Context windows, tokens, temperature, system/user/assistant roles",
      "Prompt engineering: Zero-shot, few-shot, chain-of-thought, structured JSON output",
      "API integration: Interfacing with leading LLM APIs programmatically",
      "Function calling / Tool use: Letting the model run APIs and database queries",
      "Evaluation: Speed, cost, latency, capability tradeoffs between model classes",
      "Architectural patterns: Knowing when to use fine-tuning, RAG, or prompting"
    ],
    tools: ["OpenAI API", "Anthropic Claude API", "Google Gemini API", "Ollama (local models)", "Groq (fast inference)", "Postman / curl"],
    youtube: [
      {
        channel: "AssemblyAI",
        bestFor: "Engineering tutorials on LLM integration, tool use, and evaluation",
        searchUrl: "https://www.youtube.com/@AssemblyAI/search?query=llm"
      },
      {
        channel: "Matthew Berman",
        bestFor: "Practical coding and comparisons of new model APIs and local runtimes",
        searchUrl: "https://www.youtube.com/@matthew_berman/search?query=ollama"
      },
      {
        channel: "IBM Technology",
        bestFor: "High-level conceptual explainers for LLM architectures and tool use",
        searchUrl: "https://www.youtube.com/@IBMTechnology/search?query=generative+ai"
      },
      {
        channel: "AI Jason",
        bestFor: "Building real-world LLM-driven applications and integrations",
        searchUrl: "https://www.youtube.com/@AIJason/search?query=llm"
      }
    ],
    project: {
      title: "Streamlit Chatbot with Live Tool / Function Calling",
      description: "Create an interactive chatbot interface in Streamlit that keeps memory of past messages, calls a model via API, and uses function calling to fetch live database records or external API data (e.g. weather)."
    }
  },
  {
    number: 5,
    title: "RAG, Vector Databases & AI Agents",
    focus: "Implement retrieval-augmented pipelines and autonomous agentic loops",
    topics: [
      "Semantic search: Text embeddings, similarity metrics (cosine, dot product)",
      "RAG pipelines: Chunking, indexing, retrieval, reranking, hybrid keyword/semantic search",
      "Vector Databases: Storing vectors, metadata filtering, similarity index creation",
      "Agent architectures: ReAct framework, planning, memory management, tool usage loops",
      "Multi-agent orchestration: Crew/autogen concepts, task handoffs",
      "Integrations: Model Context Protocol (MCP) for standard tool interfaces"
    ],
    tools: ["LangChain / LangGraph", "LlamaIndex", "Chroma / Pinecone / Weaviate", "FAISS", "CrewAI / AutoGen", "n8n (low-code workflow)"],
    youtube: [
      {
        channel: "LangChain (official)",
        bestFor: "Official RAG, LangGraph, and agent design patterns",
        searchUrl: "https://www.youtube.com/@LangChain/search?query=agents"
      },
      {
        channel: "Cole Medin",
        bestFor: "Production-ready agent building, Vector DBs, and LangGraph",
        searchUrl: "https://www.youtube.com/@ColeMedin/search?query=langgraph"
      },
      {
        channel: "Mervin Praison",
        bestFor: "Detailed comparisons and setups of CrewAI, AutoGen, and LangChain",
        searchUrl: "https://www.youtube.com/@mervinpraison/search?query=crewai"
      }
    ],
    project: {
      title: "Document RAG Engine & Tool-Calling Agent",
      description: "Build an app that indexes local PDFs/code into a Chroma vector store, retrieves relevant context for questions, and uses an agent loop (LangGraph) to decide between document retrieval and web search."
    }
  },
  {
    number: 6,
    title: "MLOps, Deployment & Portfolio",
    focus: "Containerize, deploy, monitor, and showcase production AI systems",
    topics: [
      "APIs: Building REST endpoints around model pipelines using FastAPI",
      "Containers: Dockerizing FastAPI servers and database dependencies",
      "UIs: Building quick, beautiful user interfaces in Streamlit or Gradio",
      "Cloud: Hosting containers on AWS, GCP, or Azure",
      "Observability: Latency, tokens/cost tracking, prompt logging, trace debugging",
      "Evaluation: Systematic testing of LLM responses using test sets",
      "Serving: Hosting open-weight models efficiently using vLLM"
    ],
    tools: ["FastAPI", "Docker", "Streamlit / Gradio", "AWS / GCP / Azure", "GitHub Actions (CI/CD)", "LangSmith / Weights & Biases", "vLLM"],
    youtube: [
      {
        channel: "freeCodeCamp",
        bestFor: "Comprehensive courses on FastAPI, Docker, and Cloud deployment",
        searchUrl: "https://www.youtube.com/@freecodecamp/search?query=docker+fastapi"
      },
      {
        channel: "AssemblyAI / LangChain",
        bestFor: "Best videos on LLM evaluation, observability, and LangSmith setup",
        searchUrl: "https://www.youtube.com/@AssemblyAI/search?query=evaluation"
      }
    ],
    project: {
      title: "Deployed Capstone: Production RAG platform or Agent system",
      description: "Pick a niche dataset (e.g. medical notes or a codebase). Build a RAG/Agent system behind a FastAPI server, add a Streamlit UI, containerize with Docker, deploy to the cloud, configure LangSmith logging, and publish a demo video."
    }
  }
];
