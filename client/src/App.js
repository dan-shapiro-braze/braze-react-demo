import React from 'react';
import braze from '@braze/web-sdk';
import './App.css';

require('dotenv').config()

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

  _handleInputChange(e) {
    this.setState({ externalId: e.target.value });
  }

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
        <button onClick={ this._handleFeedRefresh }>Refresh Feed</button>
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
a user is eligi)

SUBSCRIBING TO CONTENT CARD UPDATES:
It's in this React component that we're actually subscribing
to Content Card updates and making them available to be
rendered. It makes sense to do so at this Component's scope
as it is a parent component to all individual instances of
the Content Card component and, thus, is responsible for 
passing individual field values ('title', 'description', etc)
into each Content Card as it's rendered. You'll notice that 
this is the only stateful component - all others are stateless
or 'functional' components - because we require this
component to store the entire Content Card cache.
*/
/////////////////////////////////////////////////////////////
class ContentCardInbox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      cards: []
    }

    braze.display.showContentCards();
  }
  
  componentDidMount() {
    braze.subscribeToContentCardsUpdates((updates) => {
      this.setState({ cards: updates.cards });
    });
  }

  render() {
    let cardsArray = this.state.cards;
    let elements = [];

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

    return (
      <div className="ContentCardInbox">
        { elements }
      </div>
    );
  }
}

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
