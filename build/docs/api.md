## api

### easydocs(opts)

Build Documentation yo!

##### Options:

| Name       | Type         | Description                                  |
| :--------- | :----------- | :------------------------------------------- |
| generator  | Object       | Currecnt executing Yeoman generator instance |
| names      | Array        | Array holding the names of prompts to return |


##### EXAMPLE (Minimal):

```
var theme = require('easy-docs-bootstrap')

easydocs.generate({
  root: './',
  docs: './build/docs',
  src: './src',
  dest: './docs',
  theme: path.join(__dirname, '../node_modules/easy-docs-bootstrap/index.js'),
  assets: theme.assets,
  docsTmpl: theme.docsTmpl,
  pageTmpl: theme.pageTmpl,
  markdown: true,
  data: {},
  sections: {},
  pages: [{
    fileName: 'README.md',
    sections: ['easydocs']
  }]
});
```