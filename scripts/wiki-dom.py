import re,json,html,hashlib
from urllib.parse import unquote
from pathlib import Path
from html.parser import HTMLParser
class N:
 def __init__(self,tag='',attrs=(),parent=None,order=0):self.tag=tag;self.a=dict(attrs);self.parent=parent;self.kids=[];self.order=order
 def text(self):return re.sub(r'\s+',' ',''.join(c if isinstance(c,str) else c.text()+' ' for c in self.kids)).strip()
 def all(self,tag):
  out=[]
  for c in self.kids:
   if isinstance(c,N):
    if c.tag==tag:out.append(c)
    out.extend(c.all(tag))
  return out
 def parents(self):
  n=self.parent
  while n:yield n;n=n.parent
class DOM(HTMLParser):
 def __init__(self,s):super().__init__();self.root=N();self.stack=[self.root];self.order=0;self.feed(s)
 def handle_starttag(self,t,a):
  self.order+=1;n=N(t,a,self.stack[-1],self.order);self.stack[-1].kids.append(n)
  if t not in ['br','img','hr','input','link','meta','source','wbr','area']:self.stack.append(n)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,s):self.stack[-1].kids.append(s)
