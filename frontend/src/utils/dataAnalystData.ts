export interface DataAnalystMonth {
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

export const dataAnalystRoadmap: DataAnalystMonth[] = [
  {
    number: 1,
    title: "Foundations (Excel + SQL basics + Stats basics)",
    focus: "Build the base every analyst needs before touching anything fancy",
    topics: [
      "Excel/Google Sheets: VLOOKUP/XLOOKUP, INDEX-MATCH, IF, SUMIFS/COUNTIFS",
      "Pivot tables and pivot charts",
      "Data cleaning: text-to-columns, remove duplicates, conditional formatting",
      "SQL Basics: SELECT, WHERE, GROUP BY, HAVING, ORDER BY",
      "SQL Joins: INNER, LEFT, RIGHT, FULL & basic aggregations (COUNT, SUM, AVG)",
      "Statistics intro: Mean, median, mode, standard deviation, variance, distributions, correlation vs. causation"
    ],
    tools: ["Excel", "Google Sheets", "PostgreSQL / MySQL", "Online SQL sandbox"],
    youtube: [
      {
        channel: "Alex The Analyst",
        bestFor: "Free 'Data Analyst Bootcamp' playlist, structured beginner-friendly paths",
        searchUrl: "https://www.youtube.com/@AlexTheAnalyst"
      },
      {
        channel: "Chandoo / ExcelIsFun",
        bestFor: "Excel specific deep dives",
        searchUrl: "https://www.youtube.com/results?search_query=Chandoo+or+ExcelIsFun"
      }
    ],
    project: {
      title: "Clean Messy Sales/Expenses Dataset",
      description: "Clean a messy dataset using Excel or Google Sheets and build a summary dashboard with pivot tables."
    }
  },
  {
    number: 2,
    title: "SQL Deep Dive + Python Basics",
    focus: "Can clean and query real datasets confidently",
    topics: [
      "Intermediate/Advanced SQL: Subqueries, CTEs (WITH clauses)",
      "Window functions: ROW_NUMBER(), RANK(), LAG()/LEAD()",
      "Query optimization basics (indexes, EXPLAIN)",
      "Python Fundamentals: Syntax, data types, loops, functions, list/dict comprehensions",
      "Python environment: Working in Jupyter Notebook or Google Colab",
      "Python I/O: Reading/writing CSV and Excel files"
    ],
    tools: ["PostgreSQL / MySQL", "Python", "Jupyter Notebook / Colab"],
    youtube: [
      {
        channel: "techTFQ",
        bestFor: "Focused, interview-style SQL practice content",
        searchUrl: "https://www.youtube.com/results?search_query=techTFQ"
      },
      {
        channel: "codebasics",
        bestFor: "Python basics and strong hands-on project playlists",
        searchUrl: "https://www.youtube.com/@codebasics"
      }
    ],
    project: {
      title: "SQL Portfolio Piece",
      description: "Write a 10+ query SQL portfolio piece against a public dataset (e.g., an e-commerce or Olympics dataset) and push it to GitHub."
    }
  },
  {
    number: 3,
    title: "Python for Data Analysis + Statistics",
    focus: "Full exploratory data analysis on a raw dataset",
    topics: [
      "pandas + NumPy: DataFrames, filtering, groupby, merging/joining datasets",
      "Data wrangling: Handling missing data, duplicates, data type conversions",
      "Data Visualization in Python: Matplotlib and Seaborn (bar charts, histograms, box plots, heatmaps)",
      "Visualization principles: Avoid chart junk, choose the right chart type",
      "Statistics: Hypothesis testing, p-values, confidence intervals",
      "A/B testing fundamentals and regression basics (simple linear regression, correlation matrices)"
    ],
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    youtube: [
      {
        channel: "Krish Naik",
        bestFor: "Deep, practical statistics and Python content",
        searchUrl: "https://www.youtube.com/@krishnaik06"
      },
      {
        channel: "StatQuest with Josh Starmer",
        bestFor: "Statistics concepts explained simply with visuals",
        searchUrl: "https://www.youtube.com/results?search_query=StatQuest"
      }
    ],
    project: {
      title: "Python EDA on Raw Dataset",
      description: "Perform a full exploratory data analysis (EDA) notebook on a raw/messy public dataset — clean it, analyze it, visualize findings, and write a short summary of insights."
    }
  },
  {
    number: 4,
    title: "BI Tools + Advanced Skills + AI Workflows",
    focus: "Can build an interactive dashboard end-to-end",
    topics: [
      "Power BI or Tableau: Connecting data sources, data modeling, relationships",
      "Power BI specific: DAX basics (calculated columns/measures)",
      "Building interactive dashboards with slicers/filters",
      "Business Thinking: Translating a vague business question into a data question",
      "KPI/metric design, storytelling with data, case study practice",
      "AI-assisted tools: ChatGPT/Claude for exploratory analysis, Power BI/Excel Copilot"
    ],
    tools: ["Power BI", "Tableau", "ChatGPT / Claude", "Excel Copilot"],
    youtube: [
      {
        channel: "Guy in a Cube",
        bestFor: "Power BI (from Microsoft insiders) and DAX",
        searchUrl: "https://www.youtube.com/results?search_query=Guy+in+a+Cube"
      },
      {
        channel: "Luke Barousse",
        bestFor: "Data analyst career, job-market-driven skill priorities, AI tools",
        searchUrl: "https://www.youtube.com/results?search_query=Luke+Barousse"
      }
    ],
    project: {
      title: "Interactive BI Dashboard",
      description: "Create one interactive Power BI or Tableau dashboard with a written 1-page summary of business insights."
    }
  },
  {
    number: 5,
    title: "Portfolio, Resume & Job Hunt",
    focus: "3–4 polished portfolio projects + applying to jobs",
    topics: [
      "Build portfolio: Excel project, SQL project, Python EDA project, and a Capstone",
      "Resume, LinkedIn, GitHub: Quantify achievements, clean repo structure",
      "LinkedIn: Headline + About section highlighting your tools and projects",
      "Interview Prep: Practice SQL problems (timed) and case-study/business scenario questions",
      "Interview Soft Skills: Walk through portfolio projects, explain technical findings to non-technical stakeholders"
    ],
    tools: ["GitHub", "LinkedIn", "LeetCode / StrataScratch", "Forage"],
    youtube: [
      {
        channel: "Alex The Analyst",
        bestFor: "Portfolio projects and job hunting tips",
        searchUrl: "https://www.youtube.com/@AlexTheAnalyst"
      },
      {
        channel: "Luke Barousse",
        bestFor: "Analyzing real job postings and interview tips",
        searchUrl: "https://www.youtube.com/results?search_query=Luke+Barousse"
      }
    ],
    project: {
      title: "Capstone Data Analyst Project",
      description: "End-to-end story: SQL to extract, Python to clean/analyze, BI tool to visualize, plus a one-page written or slide summary aimed at a business stakeholder."
    }
  }
];
