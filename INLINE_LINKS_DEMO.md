# Inline Links Demo

## New Functionality Added

The metrics dashboard now supports **inline links** within text fields using markdown-like syntax.

### How to Use Inline Links

When in **Admin Edit Mode**, you can now add links directly within text using:

1. **URL Links**: `[Link Text](https://example.com)`
2. **Image Links**: `[Image Description](image:path/to/image.jpg)`

### Example Usage

**In Description Field:**
```
Our Series platform has been featured in [Forbes](https://www.forbes.com/...) and [Business Insider](https://www.businessinsider.com/...) with great reception.
```

**In Insight Field:**
```
This metric shows significant growth. For detailed analysis, see our [retention graph](image:/retention_graph.png) which demonstrates the trend over time.
```

**In Expanded Data Description:**
```
For more details on this cohort, view our [detailed breakdown](https://dashboard.series.com/cohorts) or the [visual analysis](image:/cohort_analysis.jpg).
```

### Features

- **Rich Text Editor**: Click the 🔗 or 🖼️ buttons in the toolbar
- **Markdown Support**: Type `[text](url)` directly in text fields
- **Image Upload**: Upload images directly through the editor
- **Auto-rendering**: Links automatically render as clickable elements
- **Image Modal**: Images open in full-screen modal when clicked

### Technical Implementation

1. **InlineLinkRenderer**: Parses and renders markdown-like links
2. **InlineLinkEditor**: Rich editor with toolbar for easy link insertion
3. **Integrated**: Works across all editable text fields:
   - Metric descriptions
   - Metric insights
   - Expanded data descriptions

### Backward Compatibility

The system maintains full backward compatibility with existing data structure while adding the new inline link functionality.
