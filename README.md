# ECS-Fargate-with-ALB
# Step-by-Step AWS Console Configuration: ECS Fargate with ALB and NAT Gateway

This guide walks you through deploying a containerized application on AWS using ECS with Fargate, an Application Load Balancer (ALB), and ECR. It includes NAT Gateways in public subnets to allow ECS tasks in private subnets to pull images from ECR,  architecture diagram:
![ECS](https://github.com/user-attachments/assets/ec531af5-6bcc-4b32-a0cb-1eb76e3c28b3)




---

## Prerequisites

- AWS account with admin privileges
- Docker image ready to deploy (optionally stored in Amazon ECR)

---

## Step 1: Create a VPC

1. Go to the [VPC Dashboard](https://console.aws.amazon.com/vpc/).
2. Click “Create VPC”.
3. Choose “VPC and more”.
4. Set the VPC name (e.g., `ecs-fargate-vpc`).
5. Add at least 2 public and 2 private subnets in different availability zones.
6. Enable “Auto-assign public IPv4 address” for public subnets.
7. Create the VPC.

---

## Step 2: Set Up Internet Gateway

1. In the VPC console, select “Internet Gateways”.
2. Click “Create internet gateway” and name it.
3. Attach the internet gateway to your VPC.

---

## Step 3: Create NAT Gateways

1. In the VPC console, select “NAT Gateways”.
2. Click “Create NAT gateway”.
3. For each public subnet, create a NAT Gateway:
    - Select the public subnet.
    - Allocate or select an Elastic IP.
    - Name the NAT Gateway (e.g., `nat-gw-az1`).
4. Wait for the NAT Gateways to become available.

---

## Step 4: Configure Route Tables

1. In the VPC console, go to “Route Tables”.
2. For the public route table:
    - Route 0.0.0.0/0 to the Internet Gateway.
    - Associate with public subnets.
3. For each private subnet’s route table:
    - Route 0.0.0.0/0 to the corresponding NAT Gateway (in the same AZ).
    - Associate each route table with its private subnet.

---

## Step 5: Create an ECR Repository (Optional)

1. Go to [ECR](https://console.aws.amazon.com/ecr/).
2. Click “Create repository”.
3. Name your repository (e.g., `my-app`).
4. Push your Docker image to ECR (follow the on-screen commands).
5. Step-by-Step to push your image using the ClI
   - Authenticate Docker to your ECR registry:
     aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<your-region>.amazonaws.com
   - Build your Docker image:
     docker build -t <your-repo-name> .
   - Tag the image for ECR:
     docker tag <your-repo-name>:latest <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/<your-repo-name>:latest
   - Push image to ECR:
     docker push <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/<your-repo-name>:latest

   
![Screenshot (12)](https://github.com/user-attachments/assets/f40fb2a1-cab3-485f-a4e4-5bc8bb4d3f7b)


---

## Step 6: Create an ECS Cluster

1. Go to [ECS](https://console.aws.amazon.com/ecs/).
2. Click “Clusters” > “Create Cluster”.
3. Select “Networking only (Fargate)”.
4. Name your cluster and select the VPC and subnets created earlier.
5. Create the cluster.
![Screenshot (13)](https://github.com/user-attachments/assets/33bc1fb5-4391-42bc-a6de-97506c29e520)



---

## Step 7: Create a Task Definition

1. In ECS, go to “Task Definitions” > “Create new Task Definition”.
2. Choose “FARGATE”.
3. Set task and container definitions:
    - Assign a name.
    - ![Screenshot (14)](https://github.com/user-attachments/assets/64d97069-2ccc-4cc7-943d-7a1b9546c62e)

    - Select task role (optional).
    - Set network mode: “awsvpc”.
    - Add container:
        - Name and image URI (from ECR or Docker Hub).
        - Set memory and CPU.
        - Expose the necessary port (e.g., 80 or 5000).
4. Save the task definition.


---

## Step 8: Create an Application Load Balancer

1. Go to [EC2 > Load Balancers](https://console.aws.amazon.com/ec2/v2/home#LoadBalancers).
2. Click “Create Load Balancer” > “Application Load Balancer”.
3. Give it a name, select “internet-facing”, and IPv4.
4. Select the public subnets.
5. Configure a security group (allow HTTP, optionally HTTPS).
 6. Create a target group (type: IP, protocol: HTTP, port: your container’s port).
7. Register targets later (ECS will auto-register).
  ![Screenshot (18)](https://github.com/user-attachments/assets/77530120-c2d4-4286-842e-3c0a696f14db)
---

## Step 9: Create an ECS Service

1. In your ECS cluster, go to “Services” > “Create”.
2. Launch type: FARGATE.
![Screenshot (16)](https://github.com/user-attachments/assets/600c315f-09cc-47c7-8f0d-bb96c71bee51)
3. Task definition: select the one you created.
4. Cluster: select your cluster.
5. Service name: enter a name.
6. Number of tasks: set desired count.
    ![Screenshot (18)](https://github.com/user-attachments/assets/77530120-c2d4-4286-842e-3c0a696f14db)
7. Networking:
    - VPC: select your VPC.
    - Subnets: select private subnets.
    - Security group: allow traffic from ALB.
8. Load balancing:
    - Enable "Application Load Balancer".
    - Choose your ALB and target group.
    - Map container port to listener port.
9. Review and create the service.

---

## Step 10: Test the Setup

1. When the service is running, go to your ALB’s DNS name (from EC2 > Load Balancers).
2. Confirm your application is accessible.
![Screenshot (22)](https://github.com/user-attachments/assets/8bc4518e-66ca-42dc-9fad-aa3b6868d889)
   

---


- Users access the Application Load Balancer in public subnets.
- ALB forwards traffic to ECS tasks running in private subnets.
- Private subnets route internet-bound requests (such as ECR image pulls) through the NAT Gateway(s) in public subnets.

---


