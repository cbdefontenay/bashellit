export default function GitHubHint() {
    return (
        <div className="mt-6 p-4 rounded-lg border border-(--outline-variant) bg-(--surface-container) text-sm text-(--on-surface)">
            <p className="leading-relaxed">
                This is a <span className="font-medium text-(--primary)">simple Bash editor</span>, designed
                exclusively for writing <span className="font-mono">bash</span> scripts.
            </p>

            <p className="mt-2 leading-relaxed text-(--on-surface-variant)">
                You may want to visit the GitHub repository to get more information, leave a ⭐ if you like the
                project, or share suggestions and ideas.
            </p>

            <a
                href="https://github.com/cbdefontenay/bashellit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 font-medium text-(--primary) hover:underline"
            >
                → github.com/cbdefontenay/bashellit
            </a>
        </div>
    );
}
