# Infrastructure and deployment

Terraform configuration, Ansible playbook and Kubernetes manifests used to provision and operate the ParkRee production cluster on Microsoft Azure.

## Folders

| Folder | Role |
|---|---|
| `terraform/` | Provisions the Azure infrastructure declaratively: virtual machines, network, public IP addresses, security rules |
| `ansible/` | Configures the machines once they exist: installs and sets up k3s, with no agent required on the target |
| `k8s/` | Kubernetes manifests for each service, plus the Azure specific overlay in `k8s/overlays/azure` (ingress, network policies, GitOps supervision policy) |

## Deploying

1. Provision the infrastructure:
```bash
cd terraform
terraform init
terraform apply
```
2. Install and configure k3s on the provisioned machines:
```bash
cd ../ansible
ansible-playbook -i inventaire.ini cluster.yml
```
3. Deploy the services to the cluster:
```bash
kubectl apply -k ../k8s/overlays/azure
```

## Current status

The production deployment on Azure (Azure for Students subscription) was torn down with `terraform destroy` after the internship demonstration, to stop billing. The environment is reproducible in minutes by repeating the steps above against any cloud provider supported by Terraform.
