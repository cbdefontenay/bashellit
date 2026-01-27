pub fn format_bash(content: &str) -> String {
    let mut formatted = String::new();
    let mut indent_level: usize = 0;
    let indent_size = 4;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            formatted.push('\n');
            continue;
        }

        let words: Vec<&str> = trimmed.split_whitespace().collect();
        let first_word = words.first().unwrap_or(&"").trim_end_matches(';');
        let last_word = words.last().unwrap_or(&"").trim_end_matches(';');

        // Keywords that decrease indentation BEFORE the line is added
        let starts_with_decrease = matches!(first_word, "done" | "fi" | "}" | "esac" | "else" | "elif");

        if starts_with_decrease {
            indent_level = indent_level.saturating_sub(1);
        }

        // Add the indented line
        formatted.push_str(&" ".repeat(indent_level * indent_size));
        formatted.push_str(trimmed);
        formatted.push('\n');

        // Keywords that increase indentation AFTER the line is added
        let ends_with_increase = matches!(last_word, "do" | "then" | "{" | "else")
            || (first_word == "case" && !trimmed.contains("esac"));

        if ends_with_increase {
            indent_level += 1;
        }
    }

    // Remove trailing newline if original didn't have it, but usually we want one
    if !content.ends_with('\n') && formatted.ends_with('\n') {
        formatted.pop();
    }

    formatted
}
