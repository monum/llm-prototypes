import dino_avatar from './assets/dino.jpg';
import boston_avatar from './assets/boston_icon.jpg';

const fileCategories = [
    'Arts and Culture',
    'Community Engagement',
    'Communications',
    'Economic Opportunity and Inclusion',
    'Environment, Energy, and Open Space',
    'Equity and Inclusion',
    'Finance',
    'Human Services',
    'Housing and Neighborhood Development',
    'Innovation and Technology',
    'Mayor\'s Office',
    'Operations',
    'People Operations',
    'Policy and Planning',
    'Public Health',
    'Schools',
    'Streets',
    'Non-Mayoral Departments',
    'Public Safety'
  ]

const appName = "Boston LLM";
const appEmoji = '🤖';

const userAvatar = dino_avatar;
const modelAvatar = boston_avatar;

const primaryColor = "#c12f2f";
const secondaryColor = 'rgb(5, 30, 52)';
const tertiaryColor = 'rgb(102, 157, 246)';

const sidebarBackgroundColor = secondaryColor;
const sidebarTitleColor = tertiaryColor;
const sidebarTitleText = 'Tools';
const sidebarToggleButtonColor = primaryColor;

const customs =  {
  fileCategories,
  appName,
  appEmoji,
  modelAvatar,
  userAvatar,
  sidebarBackgroundColor,
  sidebarTitleColor,
  sidebarTitleText,
  sidebarToggleButtonColor
}
export default customs;