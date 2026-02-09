use std::sync::LazyLock;
use syntect::parsing::{ParseState, Scope, ScopeStack, SyntaxSet};
use serde::Serialize;

static SYNTAX_SET: LazyLock<SyntaxSet> = LazyLock::new(|| SyntaxSet::load_defaults_newlines());

struct HighlightScopes {
    keyword: Scope,
    storage: Scope,
    support: Scope,
    entity_func: Scope,
    string: Scope,
    comment: Scope,
    variable: Scope,
    var_punc: Scope,
    constant: Scope,
}

static SCOPES: LazyLock<HighlightScopes> = LazyLock::new(|| HighlightScopes {
    keyword: Scope::new("keyword").unwrap(),
    storage: Scope::new("storage").unwrap(),
    support: Scope::new("support").unwrap(),
    entity_func: Scope::new("entity.name.function").unwrap(),
    string: Scope::new("string").unwrap(),
    comment: Scope::new("comment").unwrap(),
    variable: Scope::new("variable").unwrap(),
    var_punc: Scope::new("punctuation.definition.variable").unwrap(),
    constant: Scope::new("constant").unwrap(),
});

#[tauri::command]
pub fn format_bash(content: String) -> String {
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
        let starts_with_decrease =
            matches!(first_word, "done" | "fi" | "}" | "esac" | "else" | "elif");

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

        if starts_with_decrease && (first_word == "else" || first_word == "elif") {
            indent_level += 1;
        } else if ends_with_increase {
            indent_level += 1;
        }
    }

    if !content.ends_with('\n') && formatted.ends_with('\n') {
        formatted.pop();
    }

    formatted
}

#[derive(Serialize)]
pub struct HighlightedRegion {
    pub text: String,
    pub class: String,
}

#[tauri::command]
pub fn highlight_bash(line: String) -> Vec<HighlightedRegion> {
    let ss = &SYNTAX_SET;
    let syntax = ss.find_syntax_by_extension("sh").unwrap();
    let mut state = ParseState::new(syntax);
    let ops = match state.parse_line(&line, ss) {
        Ok(ops) => ops,
        Err(_) => {
            return vec![HighlightedRegion {
                text: line,
                class: "text-(--on-surface)".to_string(),
            }]
        }
    };

    let mut stack = ScopeStack::new();
    let mut regions = Vec::new();
    let mut last_index = 0;

    for (index, op) in ops {
        if index > last_index {
            let text = line[last_index..index].to_string();
            let class = get_class_for_stack(&stack).to_string();
            regions.push(HighlightedRegion { text, class });
        }
        let _ = stack.apply(&op);
        last_index = index;
    }

    if last_index < line.len() {
        let text = line[last_index..].to_string();
        let class = get_class_for_stack(&stack).to_string();
        regions.push(HighlightedRegion { text, class });
    }

    regions
}

fn get_class_for_stack(stack: &ScopeStack) -> &'static str {
    let s = &*SCOPES;

    for scope in stack.as_slice().iter().rev() {
        if s.keyword.is_prefix_of(*scope) || s.storage.is_prefix_of(*scope) {
            return "text-(--primary) font-bold";
        }
        if s.support.is_prefix_of(*scope) || s.entity_func.is_prefix_of(*scope) {
            return "text-(--secondary) font-semibold";
        }
        if s.string.is_prefix_of(*scope) {
            return "text-(--tertiary)";
        }
        if s.comment.is_prefix_of(*scope) {
            return "text-(--on-surface-variant) opacity-50 italic";
        }
        if s.variable.is_prefix_of(*scope) || s.var_punc.is_prefix_of(*scope) {
            return "text-blue-400 dark:text-blue-300";
        }
        if s.constant.is_prefix_of(*scope) {
            return "text-(--tertiary) opacity-80";
        }
    }

    "text-(--on-surface)"
}
