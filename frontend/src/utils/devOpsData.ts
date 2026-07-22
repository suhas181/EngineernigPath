export interface DevOpsMonth {
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

export const devOpsRoadmap: DevOpsMonth[] = [
  {
    number: 1,
    title: "Linux, Networking, Git & Scripting Foundations",
    focus: "Terminal comfort, basic networking, Git version control, and scripting automation",
    topics: [
      "Linux filesystem hierarchy, permissions (chmod, chown), users/groups, process management, and systemd",
      "Text processing commands: grep, sed, awk, find, pipes, and input/output redirection",
      "SSH connections, SSH keys, default configuration, and basic port forwarding/tunneling",
      "Networking fundamentals: TCP/IP stack, DNS resolution, HTTP/HTTPS protocols, ports, and firewalls",
      "Git & GitHub workflow (init, branch, merge, rebase, stash, resolving conflicts, PRs)",
      "Scripting: writing automation scripts in Bash and basic Python for log parsing and cleanup"
    ],
    tools: ["Ubuntu Linux (WSL2/VM)", "Git", "GitHub", "tmux", "Python 3"],
    youtube: [
      {
        channel: "NetworkChuck",
        bestFor: "Best entry point for Linux & networking, very beginner-friendly and high-energy",
        searchUrl: "https://www.youtube.com/@NetworkChuck"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Full-length free courses on Linux basics and Git version control workflows",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Linux+Beginners"
      },
      {
        channel: "TechWorld with Nana",
        bestFor: "High-quality overview videos to orient yourself on Git/GitHub fundamentals",
        searchUrl: "https://www.youtube.com/results?search_query=TechWorld+with+Nana+Git"
      }
    ],
    project: {
      title: "Bash & Python Automation Toolkit",
      description: "Build a shell and Python script toolkit that monitors disk space usage, rotates and cleans log files, and triggers a Slack webhook alert if disk usage crosses a safety threshold."
    }
  },
  {
    number: 2,
    title: "Cloud Fundamentals (AWS) + Docker & Containers",
    focus: "AWS core services, Docker containerization, registries, and secure builds",
    topics: [
      "Core AWS: IAM policies/roles, EC2 virtualization, VPC networks (subnets, route tables, security groups)",
      "AWS S3 storage buckets, RDS databases, Application Load Balancers (ALBs), and Route 53 DNS",
      "AWS CLI installation, credentials configuration, and command-line automation",
      "Docker containerization: Dockerfiles, image layers, caching, and multi-stage container builds",
      "Multi-container local deployments using docker-compose and image security basics"
    ],
    tools: ["AWS Free Tier", "AWS CLI", "Docker Desktop", "Amazon ECR", "Docker Hub"],
    youtube: [
      {
        channel: "TechWorld with Nana",
        bestFor: "Excellent Docker crash courses and AWS container infrastructure playlists",
        searchUrl: "https://www.youtube.com/results?search_query=TechWorld+with+Nana+Docker"
      },
      {
        channel: "DevOps Directive (Sid Palas)",
        bestFor: "Practical AWS deployments, container workflows, and live architectural walkthroughs",
        searchUrl: "https://www.youtube.com/results?search_query=DevOps+Directive"
      },
      {
        channel: "Abhishek.Veeramalla",
        bestFor: "Complete DevOps playlist with Docker and AWS projects, geared for hands-on learners",
        searchUrl: "https://www.youtube.com/results?search_query=Abhishek+Veeramalla"
      }
    ],
    project: {
      title: "Containerized Web App Deployed to AWS EC2",
      description: "Containerize a simple REST API app using a multi-stage Dockerfile, push the image to Docker Hub or ECR, then deploy it manually to an AWS EC2 instance behind an ALB."
    }
  },
  {
    number: 3,
    title: "CI/CD Pipelines + Infrastructure as Code + Config Mgmt",
    focus: "Continuous Integration & Deployment, infrastructure provisioning, and remote state",
    topics: [
      "CI/CD concepts: build, test, package, and deploy pipeline stages with artifact management",
      "GitHub Actions: custom workflows, runner environments, secret tokens, and build matrices",
      "Jenkins automation: pipeline-as-code scripting (Jenkinsfiles) and agent configurations",
      "Terraform Infrastructure as Code (IaC): providers, state, variables, modules, and workspaces",
      "Ansible configuration management: playbooks, roles, inventories, and idempotency patterns"
    ],
    tools: ["GitHub Actions", "Jenkins (Docker)", "Terraform CLI", "Ansible", "Terraform Cloud"],
    youtube: [
      {
        channel: "TechWorld with Nana",
        bestFor: "Clear playlists covering CI/CD (GitHub Actions, Jenkins) and Terraform IaC",
        searchUrl: "https://www.youtube.com/results?search_query=TechWorld+with+Nana+Terraform"
      },
      {
        channel: "Jeff Geerling",
        bestFor: "Excellent configuration management tutorials from the author of Ansible for DevOps",
        searchUrl: "https://www.youtube.com/results?search_query=Jeff+Geerling"
      },
      {
        channel: "Anton Putra",
        bestFor: "Rigorous, production-grade Terraform configurations and AWS infrastructure blueprints",
        searchUrl: "https://www.youtube.com/results?search_query=Anton+Putra+Terraform"
      }
    ],
    project: {
      title: "Automated Git-to-Cloud Infrastructure & Deployment Pipeline",
      description: "Build a GitHub Actions pipeline that triggers on push: runs tests, compiles a Docker image, pushes it to ECR, uses Terraform to provision EC2/VPC infra, and uses Ansible to deploy the container."
    }
  },
  {
    number: 4,
    title: "Kubernetes + GitOps + Observability",
    focus: "Orchestration, declarative GitOps deployments, monitoring, and dashboard metrics",
    topics: [
      "Kubernetes architecture: control plane, kubelet agents, etcd storage, and nodes",
      "Core K8s objects: Pods, Deployments, ReplicaSets, Services, Ingress routes, ConfigMaps, and Secrets",
      "Helm package manager: chart creation, templating values, and cluster releases",
      "Declarative GitOps deployment workflows using ArgoCD or Flux cluster reconciliation",
      "Observability tools: metrics scraping (Prometheus), centralized dashboards (Grafana), and log aggregation"
    ],
    tools: ["kubectl CLI", "Minikube / Kind", "Amazon EKS", "Helm", "ArgoCD", "Prometheus", "Grafana"],
    youtube: [
      {
        channel: "TechWorld with Nana",
        bestFor: "The most-recommended free Kubernetes, Helm, and ArgoCD crash courses for beginners",
        searchUrl: "https://www.youtube.com/results?search_query=TechWorld+with+Nana+Kubernetes"
      },
      {
        channel: "KodeKloud",
        bestFor: "Highly practical Kubernetes certification lab walk-throughs (CKA/CKAD)",
        searchUrl: "https://www.youtube.com/results?search_query=KodeKloud+CKA"
      },
      {
        channel: "DevOps Toolkit (Viktor Farcic)",
        bestFor: "Opinionated Kubernetes tutorials, GitOps delivery, and cloud-native architecture patterns",
        searchUrl: "https://www.youtube.com/results?search_query=DevOps+Toolkit"
      }
    ],
    project: {
      title: "Helm-packaged GitOps ArgoCD Deployment with Prometheus monitoring",
      description: "Deploy a multi-service application to a local cluster or EKS, package it with Helm, and configure ArgoCD for Git-sync. Attach Prometheus & Grafana to monitor CPU, memory, and latencies."
    }
  },
  {
    number: 5,
    title: "Platform Engineering, DevSecOps & Job Readiness",
    focus: "Internal Developer Platforms, self-service portals, policy guardrails, and interview prep",
    topics: [
      "Platform engineering concepts: Internal Developer Platforms (IDP) and developer self-service golden paths",
      "Backstage developer portal: software catalog, project templates, and portal plug-ins",
      "Crossplane: Kubernetes-native cloud provider infrastructure provisioning",
      "DevSecOps: container image vulnerability scanning (Trivy) and policy-as-code guardrails (OPA)",
      "Mock interviews, DevOps system design questions, DORA metric optimizations, and resume polishing"
    ],
    tools: ["Backstage", "Crossplane", "Trivy Scanner", "OPA/Gatekeeper", "HashiCorp Vault"],
    youtube: [
      {
        channel: "DevOps Toolkit (Viktor Farcic)",
        bestFor: "The leading creator covering Backstage portals, Crossplane, and Platform engineering",
        searchUrl: "https://www.youtube.com/results?search_query=DevOps+Toolkit+Platform+Engineering"
      },
      {
        channel: "CNCF (Cloud Native Computing Foundation)",
        bestFor: "Official talks from KubeCon and PlatformCon explaining enterprise setups at scale",
        searchUrl: "https://www.youtube.com/results?search_query=CNCF+Platform+Engineering"
      },
      {
        channel: "KodeKloud",
        bestFor: "Practical security workshops covering HashiCorp Vault, Trivy, and OPA configuration",
        searchUrl: "https://www.youtube.com/results?search_query=KodeKloud+Vault"
      }
    ],
    project: {
      title: "Mini Internal Developer Platform (Capstone)",
      description: "Stand up Backstage with a software catalog, define a golden path template that scaffolds and auto-deploys a service, add Trivy security scanning, and enforce OPA deployment limit policies."
    }
  }
];
