#!/bin/bash

# Get DB Resource ID
DB_RESOURCE_ID=$(aws rds describe-db-instances \
    --db-instance-identifier church-app-db \
    --query 'DBInstances[0].DbiResourceId' \
    --output text)

# Create updated RDS policy
cat > rds-access-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "rds-db:connect"
            ],
            "Resource": [
                "arn:aws:rds-db:us-east-1:522814712595:dbuser:${DB_RESOURCE_ID}/*"
            ]
        }
    ]
}
EOF

# Update the policy
aws iam create-policy \
    --policy-name church-app-rds-access \
    --policy-document file://rds-access-policy.json

# Attach to EB role
aws iam attach-role-policy \
    --role-name church-app-eb-role \
    --policy-arn arn:aws:iam::522814712595:policy/church-app-rds-access 