import 'normalize.css/normalize.css';
import '../css/main.css';
import './page.css';
import img from '../img/unicorn.jpg';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded', 'page-about');
  console.log('Image through require()', img);
});
