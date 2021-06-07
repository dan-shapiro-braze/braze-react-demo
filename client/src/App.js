import React from 'react';
import braze from '@braze/web-sdk';
import './App.css';

require('dotenv').config()

/////////////////////////////////////////////////////////////
/* 
NAME:
Inbox Header Component

PURPOSE: 
This component will live in the top part of the page, right
above the ContentCardsInbox component. This is where you can
refresh the feed and change External ID

CHANGING USERS:
This is one of 2 React components - in addition to the
ContentCardInbox component - that is required the maintain
state. In this case, we need to store the External ID in
a state field called 'externalId' where it can be accessed by
the changeUser() method
*/
/////////////////////////////////////////////////////////////
class InboxHeader extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      externalId: ''
    }

    this._handleInputChange = this._handleInputChange.bind(this);
    this._handleSignIn = this._handleSignIn.bind(this);
  }

  // When 'Refresh Feed' button is clicked, this event handler
  // will fire and trigger a Content Card refresh from Braze
  _handleFeedRefresh() {
    braze.requestContentCardsRefresh();

    alert('Feed refreshed');
  }

  // Will update component state with External ID typed into
  // the form where it can be accessed by changeUser()
  _handleInputChange(e) {
    this.setState({ externalId: e.target.value });
  }

  // Will read the External ID stored in the component's state
  // and pass it to changeUser(), signing the user in
  _handleSignIn(e) {
    e.preventDefault();
    braze.changeUser(this.state.externalId);
    alert('External ID changed to: ' + this.state.externalId); 
  }

  render() {
    return (
      <div className="InboxHeader">
        <h1>Braze React Sandbox</h1>
        <h2>Learn How Content Cards Work with React</h2>
        <button onClick={ this._handleFeedRefresh }>Refresh Feed</button><br /><br />
        <form onSubmit={ this._handleSignIn }>
          <input type="text" placeholder="External ID" onChange={ this._handleInputChange }></input>
          <input type="submit" />
        </form>
      </div>
    );
  }
}

/////////////////////////////////////////////////////////////
/* 
NAME:
Container Component for Content Cards Inbox 

PURPOSE: 
This is the container where individual Content Card
components are rendered (depending on number of Content Cards
a user is eligigible)

SUBSCRIBING TO CONTENT CARD UPDATES:
It's in this React component that we're actually subscribing
to Content Card updates and making them available to be
rendered. It makes sense to do so at this Component's scope
as it is a parent component to all individual instances of
the Content Card component and, thus, is responsible for 
passing individual field values ('title', 'description', etc)
into each Content Card as it's rendered.

A NOTE ON COMPONENTDIDMOUNT():
This is a React Lifecycle method that will execute all code
within it once this React component is mounted onto the DOM.
We are wrapping the Content Card subscriber method in
componentDidMount() because we want to ensure the state is
first set - since the constructor method always executes
first in a React class - before we try to modify it by
storing the Content Cards cache there

LOOPING THROUGH THE CACHE AND RENDERING CARDS:
within the render() method we're looping through the locally
stored copy of the Content Cards cache, choosing which
template to use for a given card, based on it's type, and 
passing individual field values down to each instance of
the component (e.g. title={ cardsArray[i].title }). Within
each individual Content Card we can access field values
through that cards 'props' object
*/
/////////////////////////////////////////////////////////////
class ContentCardInbox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      cards: null,
      loading: true
    }

    // braze.display.toggleContentCards('ContentCardInbox');
  }
  
  componentDidMount() {
    braze.requestContentCardsRefresh();

    braze.subscribeToContentCardsUpdates((updates) => {
      this.setState({ cards: updates.cards });
    });
  }
  
  render() {
    let elements = [];
    const cardsArray = this.state.cards;

    if (cardsArray) {
      for (let i = 0; i < cardsArray.length; i++) {
        switch(cardsArray[i].zc) {
          case 'ab-classic-card':
            elements.push(<ClassicContentCard 
                            key={ i }
                            title={ cardsArray[i].title } 
                            description={ cardsArray[i].description } />)
            break;
          case 'ab-captioned-image':
            elements.push(<CaptionedImgContentCard
                            key={ i} 
                            img={ cardsArray[i].imageUrl }
                            title={ cardsArray[i].title } 
                            description={ cardsArray[i].description } />)
            break;
          case 'ab-banner-card':
            elements.push(<BannerContentCard 
                            key={ i }
                            img={ cardsArray[i].img } />)
            break;
        }
        console.log(cardsArray[i]);
      }
      return elements;
    }

    if (!cardsArray) {
      return <p>Loading Cards...</p>
    } else {
      return <p>Cards Loaded</p>
    }
  }
}
/////////////////////////////////////////////////////////////
/*
The React component templates, below, are where we define 
the structure of how each type of Content Card should look.

These are each functional (stateless) components because they
don't need to maintain their own state, only inherit values
from the parent - ContentCardInbox - component. These
inherited values (title, description, img, etc) are stored
within each component's 'props' object.
*/
/////////////////////////////////////////////////////////////

/* Template Component for Classic Content Card */
/////////////////////////////////////////////////////////////
function ClassicContentCard(props) {
  return (
    <div className="CardBody" id="ClassicCard">
      <h1>{ props.title }</h1>
      <h2>{ props.description }</h2>
    </div>
  );
}

/* Template Component for Banner Content Card */
/////////////////////////////////////////////////////////////
function BannerContentCard(props) {
  return (
    <div className="CardBody" id="BannerCard">
      <img src={ props.img }></img>
    </div>
  );
}

/* Template Component for Captioned Image Content Card */
/////////////////////////////////////////////////////////////
function CaptionedImgContentCard(props) {
  return (
    <div className="CardBody" id="CaptionedCard">
      <img src={ props.img }></img>
      <h1>{ props.title }</h1>
      <p>{ props.description }</p>
    </div>
  );
}

/* Main App Container */
/////////////////////////////////////////////////////////////
function App() {

  braze.initialize('55941d70-70fe-4acb-bc5f-b389fc9f5570', {
    baseUrl: 'sondheim.braze.com',
    enableLogging: true
  });

  braze.openSession();

  return (
    <div className="App">
      <InboxHeader />
      <ContentCardInbox />
    </div>
  );

}

export default App;
