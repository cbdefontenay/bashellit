use dioxus::prelude::*;
use syntect::parsing::{SyntaxSet, ParseState, ScopeStack, Scope};
use std::sync::LazyLock;

// Global syntax set loaded once for the whole application.
// We use the default set which includes Bash and many other common languages.
static SYNTAX_SET: LazyLock<SyntaxSet> = LazyLock::new(|| {
    SyntaxSet::load_defaults_newlines()
});

// Pre-defined scopes for efficient matching.
// This avoids repeated string allocations and parsing during highlighting.
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

#[component]
pub fn HighlightedLine(line: String) -> Element {
    let ss = &SYNTAX_SET;
    // Find the Bash syntax. Default set always includes it.
    let syntax = ss.find_syntax_by_extension("sh").unwrap();
    
    // We use syntect's parsing engine to tokenize the line.
    // While this implementation is line-by-line, it is significantly more robust
    // than the previous manual tokenizer and handles edge cases like nested 
    // escapes and complex Bash patterns much better.
    let mut state = ParseState::new(syntax);
    let ops = match state.parse_line(&line, ss) {
        Ok(ops) => ops,
        Err(_) => return rsx! {
            span { "{line}" }
        },
    };
    
    let mut stack = ScopeStack::new();
    let mut regions = Vec::new();
    let mut last_index = 0;
    
    // Iterate over the parsed regions of the line
    for (index, op) in ops {
        if index > last_index {
            let text = line[last_index..index].to_string();
            let class = get_class_for_stack(&stack);
            regions.push((text, class));
        }
        let _ = stack.apply(&op);
        last_index = index;
    }
    
    // Add the remaining text if any
    if last_index < line.len() {
        let text = line[last_index..].to_string();
        let class = get_class_for_stack(&stack);
        regions.push((text, class));
    }
    
    rsx! {
        span { class: "whitespace-pre",
            for (text , class) in regions {
                span { class: "{class}", "{text}" }
            }
        }
    }
}

/// Maps a Syntect scope stack to the application's Tailwind CSS classes.
/// This ensures the highlighting automatically adapts to the user's selected theme.
fn get_class_for_stack(stack: &ScopeStack) -> &'static str {
    let s = &*SCOPES;
    
    // Iterate backwards through the stack to find the most specific match first
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
