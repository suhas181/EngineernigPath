export interface CyberSecurityMonth {
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

export const cyberSecurityRoadmap: CyberSecurityMonth[] = [
  {
    number: 1,
    title: "Computer & Networking Fundamentals",
    focus: "How computers and networking work at a foundational level",
    topics: [
      "How a computer actually works: CPU, RAM, storage, and the role of the OS",
      "Networking fundamentals: OSI 7-layer model vs. TCP/IP model",
      "IP addressing basics, subnetting concepts, DNS, and DHCP",
      "Core protocols and default ports: HTTP/HTTPS (80/443), SSH (22), FTP (21), DNS (53), RDP (3389), SMTP (25)",
      "Command Line comfort: Windows PowerShell and your first Linux terminal",
      "Core cybersecurity vocabulary: Threat, vulnerability, risk, exploit, and the CIA triad (Confidentiality, Integrity, Availability)"
    ],
    tools: ["VirtualBox", "Wireshark", "Cisco Packet Tracer", "Ubuntu Linux (VM)"],
    youtube: [
      {
        channel: "NetworkChuck",
        bestFor: "Best on-ramp for networking & Linux basics, energetic and project-based",
        searchUrl: "https://www.youtube.com/@NetworkChuck"
      },
      {
        channel: "David Bombal",
        bestFor: "Deeper networking fundamentals for concepts that need extra explanation",
        searchUrl: "https://www.youtube.com/results?search_query=David+Bombal"
      },
      {
        channel: "Professor Messer",
        bestFor: "Free Network+ (N10-009) playlist for fundamentals (OSI, IP, ports/protocols)",
        searchUrl: "https://www.youtube.com/results?search_query=Professor+Messer+Network%2B"
      }
    ],
    project: {
      title: "Wireshark Packet Analysis & VM Setup",
      description: "Install VirtualBox, stand up your first Ubuntu Linux VM, capture your home network traffic using Wireshark, and successfully locate a DNS lookup and an HTTP request."
    }
  },
  {
    number: 2,
    title: "Linux, Security Concepts & Scripting Basics",
    focus: "Linux fundamentals, core security concepts, and scripting foundations",
    topics: [
      "Linux filesystem structure, user/group management, permissions (chmod, chown), and package managers",
      "The CIA Triad in depth & AAA (Authentication, Authorization, Accounting) frameworks",
      "Common threat types: Malware, phishing, social engineering, DoS/DDoS attacks",
      "Cryptography basics: Symmetric vs. asymmetric encryption, hashing, and TLS protocol mechanics",
      "Python scripting basics: Variables, loops, conditionals, and functions to write/read simple scripts"
    ],
    tools: ["Kali Linux (VM)", "Python 3", "VS Code", "TryHackMe (Pre Security Path)"],
    youtube: [
      {
        channel: "NetworkChuck",
        bestFor: "'Linux for Hackers' series and hands-on Linux tutorials",
        searchUrl: "https://www.youtube.com/results?search_query=NetworkChuck+Linux+for+Hackers"
      },
      {
        channel: "Professor Messer",
        bestFor: "Free Security+ SY0-701 playlist (Domains 1-2, mid-2026 exam update)",
        searchUrl: "https://www.youtube.com/results?search_query=Professor+Messer+Security%2B+SY0-701"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Python basics crash course for syntax and programming fundamentals",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Python+tutorial"
      }
    ],
    project: {
      title: "TryHackMe Pre Security & Python Port Script",
      description: "Complete the TryHackMe Pre Security learning path and write a short Python script that reads a list of port numbers and prints out their default service names."
    }
  },
  {
    number: 3,
    title: "Security+ Core Concepts + Hands-On Tools",
    focus: "Threats, mitigations, security architecture, and active scanning tools",
    topics: [
      "Threats, vulnerabilities, and mitigations in depth (Security+ Domain 2)",
      "Security architecture: Firewalls, IDS/IPS, VPNs, zero trust architecture, and cloud security basics (Security+ Domain 3)",
      "Nmap scanning fundamentals: Host discovery, port scanning, and service/OS detection",
      "Reading Wireshark captures with precision (filters, following TCP streams)"
    ],
    tools: ["Nmap", "Wireshark (Advanced)", "TryHackMe (Cyber Security 101)", "Burp Suite Community Edition"],
    youtube: [
      {
        channel: "Professor Messer",
        bestFor: "Security+ SY0-701 Domains 2-3 lessons and daily study groups",
        searchUrl: "https://www.youtube.com/results?search_query=Professor+Messer+Security%2B+SY0-701"
      },
      {
        channel: "HackerSploit",
        bestFor: "Structured Nmap scanning tutorials and security tool walkthroughs",
        searchUrl: "https://www.youtube.com/results?search_query=HackerSploit+Nmap"
      },
      {
        channel: "John Hammond",
        bestFor: "Beginner-accessible cybersecurity concepts, malware analysis, and walkthroughs",
        searchUrl: "https://www.youtube.com/results?search_query=John+Hammond"
      }
    ],
    project: {
      title: "Nmap Host Scanning & Capture Analysis",
      description: "Perform Nmap scans against your own local VM laboratory (never anything you don't own), inspect open ports/services, and analyze the resulting traffic in Wireshark."
    }
  },
  {
    number: 4,
    title: "Security Operations & Blue Team Basics",
    focus: "Incident response, monitoring, SIEM logs, and endpoint security",
    topics: [
      "Security+ Domain 4 (Security Operations): Incident response processes, monitoring, centralized logging, and SOAR systems",
      "SIEM (Security Information and Event Management) concepts: Log collection, normalization, and parsing",
      "Windows endpoint security: Event Viewer, security logs, and basic system hardening concepts",
      "Introduction to security operations: Understanding the day-to-day work of a SOC Analyst"
    ],
    tools: ["Splunk Free", "Security Onion", "TryHackMe (SOC Level 1 Path)", "Windows VM"],
    youtube: [
      {
        channel: "13Cubed",
        bestFor: "High-quality, free tutorials on log analysis, DFIR, and blue-team forensics",
        searchUrl: "https://www.youtube.com/@13cubed"
      },
      {
        channel: "Professor Messer",
        bestFor: "Security+ SY0-701 Domain 4 (Operations) and Domain 5 lessons",
        searchUrl: "https://www.youtube.com/results?search_query=Professor+Messer+Security%2B+SY0-701"
      },
      {
        channel: "Simply Cyber",
        bestFor: "SOC Analyst job insights, interview prep, and career transition tips",
        searchUrl: "https://www.youtube.com/@SimplyCyber"
      }
    ],
    project: {
      title: "SIEM Splunk Setup & Log Parsing",
      description: "Set up Splunk Free or Security Onion locally, import a sample web server log, write search queries to parse traffic, and identify suspicious anomalies."
    }
  },
  {
    number: 5,
    title: "Governance, Consolidation, Practice Exams & Portfolio",
    focus: "Governance, Risk & Compliance (GRC), consolidation, and exam preparation",
    topics: [
      "Security+ Domain 5 (GRC): Security policies, standard frameworks (NIST, ISO 27001 overview), and risk management vocabulary",
      "Comprehensive 5-domain review for the CompTIA Security+ SY0-701 exam",
      "Consolidation: Documenting and compiling your learning lab projects into a portfolio",
      "Exam practice: Sourcing practice exams, taking tests, and scoring 85%+ consistently"
    ],
    tools: ["Practice Exams", "GitHub (Portfolio)", "TryHackMe (Continued Labs)", "LinkedIn"],
    youtube: [
      {
        channel: "Professor Messer",
        bestFor: "Domain 5 lesson videos and exam-day preparation tips",
        searchUrl: "https://www.youtube.com/results?search_query=Professor+Messer+Security%2B+SY0-701"
      },
      {
        channel: "Simply Cyber / Outpost Gray",
        bestFor: "Portfolio layout, resume optimization, and entry-level security jobs",
        searchUrl: "https://www.youtube.com/results?search_query=Simply+Cyber+or+Outpost+Gray"
      }
    ],
    project: {
      title: "GitHub Notes Portfolio & Practice Exams",
      description: "Document 3 TryHackMe lab rooms in your own words, push your consolidated notes repository to GitHub to act as a public portfolio, and score 85%+ on security practice tests."
    }
  }
];
