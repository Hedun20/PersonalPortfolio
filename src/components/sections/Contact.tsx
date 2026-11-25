import ImmersiveSection from './ImmersiveSection';
import { contact, contactLinks } from '../../data/contact';

const items = [
  ...contactLinks.map(link=>({id:link.key,title:link.label,description:link.description,href:link.href,action:link.key==='email'?'Send a message':`Open ${link.label}`})),
  {id:'location',title:contact.locationLabel,description:contact.location},
];

export default function Contact() {
  return <ImmersiveSection id="contact" number="07" label="Get in touch" heading="Let's build something intelligent." intro="Open to new opportunities, creative projects and collaborations at the intersection of AI and software engineering." items={items} footer={{href:contact.email?`mailto:${contact.email}`:contact.linkedin,label:contact.email?'Send a message':'Connect on LinkedIn'}}/>;
}
