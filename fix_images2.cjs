const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

const match = jsx.match(/function Special\(\{title,text,action,bg,linkTo\}\)\{return <article className="special" style=\{\{backgroundImage: [^\}]+\}\}><div><h3>\{title\}<\/h3><p>\{text\}<\/p><Link className="btn ghost" to=\{linkTo\}>\{action\} <ArrowRight\/><\/Link><\/div><\/article>\}/);

if(match) {
  const newFunc = `function Special({title,text,action,bg,linkTo}){return <article className="special" style={{backgroundImage: "linear-gradient(0deg, rgba(7,9,16,1) 0%, rgba(7,9,16,0.85) 45%, rgba(7,9,16,0) 80%), url('" + bg + "')", backgroundSize: 'cover', backgroundPosition: 'center top'}}><div><h3>{title}</h3><p>{text}</p><Link className="btn ghost" to={linkTo}>{action} <ArrowRight/></Link></div></article>}`;
  jsx = jsx.replace(match[0], newFunc);
  fs.writeFileSync('src/main.jsx', jsx);
  console.log('Fixed completely.');
} else {
  console.log('Could not find match to replace');
}
