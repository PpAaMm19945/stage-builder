import { PublicLayout } from '@/components/layout/PublicLayout';

export default function TermsOfService() {
    return (
        <div className="container max-w-4xl py-12 space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold">Terms of Service</h1>
                <p className="text-muted-foreground">Last updated: December 2025</p>
            </div>

            <div className="prose prose-slate max-w-none dark:prose-invert">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using FamilyPath ("the Service"), you agree to be bound by these Terms of
                        Service. If you disagree with any part of the terms, you may not access the Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. Description of Service</h2>
                    <p>
                        FamilyPath is an educational management tool designed to help parents track their children's
                        developmental progress and access educational activities.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
                    <p>You are responsible for:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Maintaining the confidentiality of your account credentials.</li>
                        <li>The accuracy of the information you provide about yourself and your children.</li>
                        <li>Ensuring your use of the Service complies with applicable laws.</li>
                        <li>All activities that occur under your account.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are and will remain
                        the exclusive property of FamilyPath and its licensors. The Service is protected by
                        copyright, trademark, and other laws.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. Educational Disclaimer & Parental Authority</h2>
                    <p>
                        <strong>Covenantal Responsibility:</strong> We affirm that parents are the primary educators of their children, ordained by God (Deut 6, Eph 6). This platform serves as a tool to assist parents in this duty, not to replace them.
                    </p>
                    <p>
                        <strong>No Guarantee of Outcome:</strong> While we provide resources based on Reformed Christian pedagogy, we do not guarantee specific educational outcomes. The formation of a child's soul is a work of God's grace and parental stewardship.
                    </p>
                    <p>
                        <strong>Sphere Sovereignty:</strong> We respect the sphere sovereignty of the family. We claim no authority over your children or their educational path beyond the service you explicitly engage us to provide.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">6. Termination</h2>
                    <p>
                        We may terminate or suspend your account immediately, without prior notice or liability,
                        for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    <p>
                        In the event of termination, you retain the right to export your family's educational records, as these belong to you by right of your parental authority.
                    </p>
                    <p>
                        Upon termination, your right to use the Service will immediately cease. You can terminate
                        your account at any time by deleting your account via the Settings page.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">7. Changes to Terms</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any
                        time. We will provide notice of any material changes.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">8. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at
                        support@familypath.app.
                    </p>
                </section>
            </div>
        </div>
    );
}
