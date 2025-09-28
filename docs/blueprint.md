# **App Name**: SecureBank

## Core Features:

- User Authentication: Enable users to sign up, log in, and log out securely using NextAuth.js with email/password authentication.
- Account Dashboard: Display user's account information including account number, balance, and a summary of recent transactions.
- Money Transfer: Allow users to transfer money to other accounts by entering the recipient's account number, amount, and a description.
- Transaction History: Provide a paginated list of all transactions with the ability to filter by type (credit/debit) and search by date or description.
- Simulated Deposit/Withdrawal: Implement buttons or forms to simulate deposits and withdrawals, updating the balance accordingly and adding a transaction entry.
- Profile Settings: Allow users to update their profile information such as name, email, and password.
- Fraud Detection Tool: Employ an AI tool to analyze transaction patterns and flag potentially fraudulent activities based on unusual behavior (e.g., large, infrequent transfers).

## Style Guidelines:

- Primary color: Deep Blue (#1A237E) to convey trust and security.
- Background color: Light Gray (#F5F5F5) for a clean, modern look.
- Accent color: Teal (#008080) to highlight interactive elements.
- Body and headline font: 'Inter', a grotesque-style sans-serif font.
- Use modern and consistent icons from lucide-react for key actions and data visualization.
- Employ a card-based layout with clear sections for account information, transactions, and settings, utilizing shadcn/ui components for a polished appearance.
- Incorporate subtle animations for transitions and feedback, such as loading spinners or confirmation messages, to enhance the user experience.