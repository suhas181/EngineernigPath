export interface DataScientistMonth {
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

export const dataScientistRoadmap: DataScientistMonth[] = [
  {
    number: 1,
    title: "Python, Math Foundations & Environment Setup",
    focus: "Get comfortable writing Python code and refresh basic mathematical structures",
    topics: [
      "Python fundamentals: Variables, loops, functions, OOP, file handling",
      "Data structures: Lists, dicts, sets, tuples, list comprehensions",
      "Core libraries: NumPy for array manipulation, intro to pandas structures",
      "Linear algebra: Vectors, matrices, matrix multiplication, dot products",
      "Calculus & Stats: Derivatives, gradients, mean, median, variance, standard deviation",
      "Git & Version control: commit, push, branching, and pull requests"
    ],
    tools: ["Anaconda / Miniconda", "VS Code / Jupyter Notebooks", "Git & GitHub", "Python 3.x"],
    youtube: [
      {
        channel: "freeCodeCamp.org",
        bestFor: "Full-length free Python and Data Analysis with Python courses",
        searchUrl: "https://www.youtube.com/channel/UC8butISFwT-Wl7EV0hUK0BQ"
      },
      {
        channel: "Corey Schafer",
        bestFor: "Python fundamentals, object-oriented programming, and file handling",
        searchUrl: "https://www.youtube.com/@coreyms"
      },
      {
        channel: "3Blue1Brown",
        bestFor: "Intuitive visual series on linear algebra and calculus",
        searchUrl: "https://www.youtube.com/@3blue1brown"
      }
    ],
    project: {
      title: "Command-Line Utility Tool",
      description: "Build a CLI Python application (e.g., a personal budget tracker or unit converter) pushed to GitHub with a descriptive README file."
    }
  },
  {
    number: 2,
    title: "SQL, Data Wrangling & Visualization",
    focus: "Become fluent in extracting data, cleaning it, and plotting informative charts",
    topics: [
      "SQL basics & intermediate: SELECT, JOINs, GROUP BY, window functions, CTEs, subqueries",
      "pandas data manipulation: Merging datasets, reshaping, groupby aggregations, handling missing values, datetime columns",
      "Wrangling: Outlier detection, duplicates removal, type conversion pipelines",
      "Exploratory Data Analysis (EDA) core methodologies",
      "Data visualization: Choice of chart types, styling plots, storytelling with data"
    ],
    tools: ["MySQL / PostgreSQL", "pandas, NumPy", "Matplotlib, Seaborn", "Excel / Google Sheets", "Power BI / Tableau (choose one)"],
    youtube: [
      {
        channel: "Alex The Analyst",
        bestFor: "Data Analyst Bootcamp playlists including SQL, Excel, and Tableau",
        searchUrl: "https://www.youtube.com/@AlexTheAnalyst"
      },
      {
        channel: "Luke Barousse",
        bestFor: "Python for Data Analytics full course and structured SQL setups",
        searchUrl: "https://www.youtube.com/@LukeBarousse"
      },
      {
        channel: "Data School (Kevin Markham)",
        bestFor: "Deep dive pandas tutorials for structured manipulation",
        searchUrl: "https://www.youtube.com/@dataschool"
      },
      {
        channel: "Guy in a Cube",
        bestFor: "Power BI tutorial clips and dashboards layout tips",
        searchUrl: "https://www.youtube.com/guyinacube"
      },
      {
        channel: "Leila Gharani",
        bestFor: "Excel deep dives, formulas, pivot tables, and analytics setups",
        searchUrl: "https://www.youtube.com/@LeilaGharani"
      }
    ],
    project: {
      title: "Public Dataset Cleaning & Dashboard Analysis",
      description: "Clean a public dataset (Kaggle or open government portal) with pandas, write SQL transformation queries, create 3-5 visuals, and assemble a Jupyter notebook report."
    }
  },
  {
    number: 3,
    title: "Statistics, Probability & Applied EDA",
    focus: "Build statistical intuition for hypothesis testing and A/B experiments",
    topics: [
      "Probability basics: Distributions (normal, binomial, Poisson), Bayes' theorem",
      "Inferential stats: Hypothesis testing, p-values, confidence intervals, A/B testing significance",
      "Correlation vs. Causation principles",
      "Regression intro: Linear & logistic regression from a statistical significance lens",
      "Data preprocessing: Feature scaling, normalization, categorical encoding techniques"
    ],
    tools: ["SciPy", "statsmodels", "Jupyter Notebook"],
    youtube: [
      {
        channel: "StatQuest with Josh Starmer",
        bestFor: "Statistics foundations, normal curves, and statistical test significance",
        searchUrl: "https://www.youtube.com/@statquest"
      },
      {
        channel: "Brandon Foltz",
        bestFor: "Full structured statistics playlists from basic probability onwards",
        searchUrl: "https://www.youtube.com/c/BrandonFoltz"
      },
      {
        channel: "3Blue1Brown",
        bestFor: "Probability distributions visual walk-throughs",
        searchUrl: "https://www.youtube.com/@3blue1brown"
      }
    ],
    project: {
      title: "Hypothesis Testing & A/B Experimentation Report",
      description: "Perform an inferential statistical analysis on a business dataset (e.g. testing if design changes drove conversion rate increases) and write up statistical significance conclusions."
    }
  },
  {
    number: 4,
    title: "Machine Learning",
    focus: "Build, evaluate, and tune regression, classification, and clustering models",
    topics: [
      "Supervised ML: Linear/logistic regression, decision trees, random forests, gradient boosting, SVMs, KNN",
      "Unsupervised ML: K-Means clustering, PCA, hierarchical clustering",
      "Model validation: Train/test split, cross-validation, precision/recall/F1, ROC-AUC, RMSE",
      "Feature engineering: Selection techniques, scaling, handling imbalanced targets (SMOTE)",
      "Hyperparameter optimization: GridSearchCV, RandomizedSearchCV"
    ],
    tools: ["scikit-learn", "XGBoost", "LightGBM", "Jupyter / Colab"],
    youtube: [
      {
        channel: "StatQuest with Josh Starmer",
        bestFor: "Random forests, XGBoost, PCA, and ML model evaluations step-by-step",
        searchUrl: "https://www.youtube.com/@statquest"
      },
      {
        channel: "Krish Naik",
        bestFor: "End-to-end Machine Learning playlists with practical implementations",
        searchUrl: "https://www.youtube.com/@krishnaik06"
      },
      {
        channel: "Data School (Kevin Markham)",
        bestFor: "scikit-learn specific API usage, pipelines, and evaluation folds",
        searchUrl: "https://www.youtube.com/@dataschool"
      }
    ],
    project: {
      title: "End-to-End ML Prediction Project",
      description: "Pick a classic dataset (e.g. Titanic classification or House Prices regression) and go from raw data loading → cleaning → feature decisions → XGBoost model training → evaluation."
    }
  },
  {
    number: 5,
    title: "Deep Learning + Specialization Track",
    focus: "Learn neural network basics and select an NLP or Computer Vision specialization",
    topics: [
      "Deep learning bases: Forward/backward propagation, activation layers, loss metrics, optimizers (SGD/Adam)",
      "Models architecture: CNNs for images, RNNs/LSTMs/Transformers for sequences",
      "Transfer learning: Loading pretrained parameters",
      "Specialization tracks: Pick NLP/LLMs (classification, embeddings, Hugging Face), Computer Vision (OpenCV, object classification), Time Series (ARIMA, Prophet), or Applied Analytics"
    ],
    tools: ["TensorFlow / Keras or PyTorch", "Google Colab (GPU)", "Hugging Face", "OpenCV"],
    youtube: [
      {
        channel: "3Blue1Brown",
        bestFor: "Neural networks and backpropagation visual series",
        searchUrl: "https://www.youtube.com/@3blue1brown"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Full deep learning tutorials and TensorFlow/PyTorch bootcamps",
        searchUrl: "https://www.youtube.com/channel/UC8butISFwT-Wl7EV0hUK0BQ"
      },
      {
        channel: "Krish Naik",
        bestFor: "Deep learning ANN/CNN/RNN and NLP transformer playlists",
        searchUrl: "https://www.youtube.com/@krishnaik06"
      },
      {
        channel: "StatQuest with Josh Starmer",
        bestFor: "Neural networks structure and backprop explanations in friendly style",
        searchUrl: "https://www.youtube.com/@statquest"
      }
    ],
    project: {
      title: "DL Specialization Project",
      description: "Train a deep learning classifier (e.g., text sentiment analyzer using Hugging Face pipelines or custom image classifier) and save its outputs."
    }
  },
  {
    number: 6,
    title: "Deployment, Portfolio & Job Preparation",
    focus: "Wrap your models in APIs, build web interfaces, containerize, and deploy them",
    topics: [
      "Deployment: Writing RESTful API endpoints around models with Flask or FastAPI",
      "User Interface: Building interactive web demos with Streamlit or Gradio",
      "Containerization: Building basic Dockerfiles to package app code and libraries",
      "Portfolio preparation: Quantifying project impact on resumes, cleaning GitHub READMEs",
      "Interview prep: SQL queries, ML theory, stats questions, product sense case studies"
    ],
    tools: ["Flask / FastAPI", "Streamlit / Gradio", "Docker", "GitHub", "Render / Hugging Face Spaces"],
    youtube: [
      {
        channel: "Ken Jee",
        bestFor: "Data science portfolio reviews, Ken's project layouts, and career tips",
        searchUrl: "https://www.youtube.com/@KenJee_ds"
      },
      {
        channel: "Tina Huang",
        bestFor: "Resume writing tips, career growth, and ex-Meta data scientist advice",
        searchUrl: "https://www.youtube.com/@TinaHuang1"
      },
      {
        channel: "Luke Barousse",
        bestFor: "Job market analysis, data scientist skills trends, and career templates",
        searchUrl: "https://www.youtube.com/@LukeBarousse"
      }
    ],
    project: {
      title: "Deployed Capstone Web Application",
      description: "Build a FastAPI web app for an ML model, design a Streamlit frontend UI, package into a Docker container, deploy live to Render/Hugging Face Spaces, and publish on GitHub."
    }
  }
];
