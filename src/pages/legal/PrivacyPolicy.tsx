export default function PrivacyPolicy() {
    return (
        <div className="container max-w-4xl py-12 space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold">Privacy Policy</h1>
                <p className="text-muted-foreground">Last updated: December 2025</p>
            </div>

            <div className="prose prose-slate max-w-none dark:prose-invert">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Introduction</h2>
                    <p>
                        Welcome to SchoolOS ("we," "our," or "us"). We are committed to protecting your privacy
                        and ensuring the security of your data, especially considering the sensitive nature of
                        educational and child-related information. This Privacy Policy explains how we collect,
                        use, and safeguard your information when you use our application.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. Data Collection</h2>
                    <p>We collect the following types of information:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <strong>Account Information:</strong> Name, email address, and profile picture from your
                            Google account when you sign in.
                        </li>
                        <li>
                            <strong>Child Profiles:</strong> Names, dates of birth, and developmental progress data
                            that you enter for your children.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> Information about how you interact with the app, including
                            completed activities and observations.
                        </li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. Data Usage & Stewardship</h2>
                    <p>We view your family's data as a stewardship trust. We use your data solely for the following purposes:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Providing and improving the SchoolOS educational platform.</li>
                        <li>Personalizing activity recommendations based on child age and progress.</li>
                        <li>Tracking developmental milestones.</li>
                        <li>Authenticating your account and securing your data.</li>
                    </ul>
                    <p>
                        <strong>We do not sell your personal data to third parties.</strong> Your children are not commodities.
                    </p>
                    <p>
                        <strong>AI & Privacy:</strong> We use Artificial Intelligence to assist in summarizing data and recommending resources. However, we do not train public AI models on your specific family data in a way that would expose your private information to the world.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Children's Privacy & Parental Ownership</h2>
                    <p>
                        We take children's privacy seriously. SchoolOS is designed for use by parents and guardians.
                        We do not knowingly collect personal information directly from children under 13. All data
                        about children is provided and managed by the parent or guardian account holder.
                    </p>
                    <p>
                        You, the parent, retain full ownership of all educational records generated on this platform. You may export them at any time for use in other contexts (e.g., state reporting, college applications).
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. Third-Party Services</h2>
                    <p>
                        We use Google Firebase/Cloud Identity for secure authentication. Please refer to Google's
                        Privacy Policy for information on how they handle authentication data.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">6. Data Retention & Deletion</h2>
                    <p>
                        We retain your data only as long as your account is active. You may request the deletion
                        of your account and all associated data at any time through the Settings page or by
                        contacting us directly.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at
                        support@schoolos.app.
                    </p>
                </section>
            </div>
        </div>
    );
}
