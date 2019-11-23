import firebase from 'firebase'
import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'

import {myFirebase, myFirestore} from '../../config'
import {AppString} from '../../constants/AppString'

import Button from 'react-bootstrap/Button'

import './Home.css'

import YouTube from 'react-youtube';


class Home extends Component {
    constructor(props) {
        super(props);
        this.provider = new firebase.auth.GoogleAuthProvider();
        this.state = {
            isLoading: true,
            isOpenDialogConfirmLogout: false,
        }
    }

    componentDidMount() {
        this.checkLogin();
    }

    checkLogin = () => {
        if (localStorage.getItem(AppString.ID)) {
            this.setState({isLoading: false}, () => {
                this.setState({isLoading: false});
                this.props.showToast(1, `You're now logged in`);
                this.props.history.push('/papyrus')
            })
        } else {
            this.setState({isLoading: false})
        }
    };

    onLoginPress = () => {
        this.setState({isLoading: true});
        myFirebase
            .auth()
            .signInWithPopup(this.provider)
            .then(async result => {
                let user = result.user;
                if (user) {
                    const result = await myFirestore
                        .collection(AppString.NODE_USERS)
                        .where(AppString.ID, '==', user.uid)
                        .get();

                    // Set new data if this is a new user
                    if (result.docs.length === 0) {
                        myFirestore
                            .collection(AppString.NODE_USERS)
                            .doc(user.uid)
                            .set({
                                id: user.uid,
                                nickname: user.displayName
                            })
                            .then(data => {
                                // Write user info to local
                                localStorage.setItem(AppString.ID, user.uid);
                                localStorage.setItem(AppString.NICKNAME, user.displayName);
                                this.setState({isLoading: false}, () => {
                                    this.props.showToast(1, `You're now logged in`);
                                    this.props.history.push('/papyrus')
                                })
                            })
                    } else {
                        // Write user info to local since you're already in the db
                        localStorage.setItem(AppString.ID, result.docs[0].data().id);
                        localStorage.setItem(AppString.NICKNAME, result.docs[0].data().nickname
                        );
                        this.setState({isLoading: false}, () => {
                            this.props.showToast(1, `You're now logged in`);
                            this.props.history.push('/papyrus')
                        })
                    }
                } else {
                    this.props.showToast(0, `User info not available, did you exit the sign in process didn't you?`)
                }
            })
            .catch(err => {
                this.props.showToast(0, err.message);
                this.setState({isLoading: false})
            })
    };

    render() {
        return (
            <div className="viewRoot">
                <div className="header">
                    <span>
                        <span role="img" aria-label="palm">🌴</span>
                        Chat Like an Egyptian
                        <span role="img" aria-label="camel">🐪</span>
                    </span>
                </div>

                <div style={{
                    marginTop: "20px",
                }}>
                    <span style={{
                        fontSize: "30px",
                        fontStyle: "italic"
                    }}>
                        Emoji are modern hieroglyphs
                    </span>
                </div>

                <div style={{
                    width: "60%",
                    margin: "20px auto",
                }}>
                    <img
                        style={{
                            width: "35%",
                            height: "200px",
                            paddingRight: "20px",
                        }}
                        alt="facebook emoji" src={"https://firebasestorage.googleapis.com/v0/b/chat-like-an-egyptian.appspot.com/o/img%2Femoji_facebook.jpg?alt=media&token=6b7ce4b8-b19f-4f2e-bd4a-a4bdd9be10a1"}
                    />
                    <img
                        style={{
                            width: "35%",
                            height: "200px",
                        }}
                        alt="egyptian hieroglyphics" src={"https://firebasestorage.googleapis.com/v0/b/chat-like-an-egyptian.appspot.com/o/img%2Ftomb_of_seti_hieroglyphs.jpg?alt=media&token=6dfd03ef-ef9f-420d-a9e5-762714004414"}
                    />
                </div>

                <div style={{
                }}>
                    <div style={{
                        margin: "10px auto",
                        width: "500px",
                        textAlign: "left",
                    }}>
                    <span style={{
                        fontSize: "15px",
                    }}>
                        Emoji are pervasive in today’s modern communication. Be it through instant messaging or Social Media posts. They break through language barriers, letting an easier and more expressive communication between people. According to a report from Facebook released for World Emoji Day in 2018, over 700 Million emojis are used everyday in posts and over 900 Million emojis are sent everyday without text.
                    </span>
                    </div>

                    <div style={{
                        margin: "10px auto",
                        width: "500px",
                        textAlign: "left",
                    }}>
                    <span style={{
                        fontSize: "15px",
                    }}>
                        Emoji are pictograms, images that convey their meaning through their pictorial resemblance to a physical object. What other writing system uses images and symbol? Egyptian hieroglyphs, the formal writing system used in Ancient Egypt. While hieroglyphs are logograms, meaning that they can be used to compose words and syllables, they started as proto-hieroglyphs as pictograms and ideograms. They combined the expressiveness and artistic value of images with a writing system. The complexity of the writing process limited their adoption beside religious ceremonies. With the ease of modern input systems, such as virtual keyboard we are witnessing a sort of renaissance of pictographic writing.
                    </span>
                    </div>

                    <div style={{
                        marginTop: "20px",
                        margin: "10px auto",
                        width: "500px",
                    }}>
                    <span style={{
                        fontSize: "20px",
                        fontStyle: "italic",
                    }}>
                        “As a visual language emoji has already far eclipsed hieroglyphics, its ancient Egyptian precursor which took centuries to develop.” — Prof Vyv Evans, Bangor University for the Guardian
                    </span>
                    </div>

                    <div style={{
                        margin: "10px auto",
                        width: "500px",
                        textAlign: "left",
                    }}>
                    <span style={{
                        fontSize: "15px",
                    }}>
                        INSTRUCTIONS: In this web experiment we want to investigate the capability of emoji in communicating messages from simple to complex. You are going to be paired with another person. One of the participant is going to have a specific message assigned before logging in with the goal of communicating it to the recipient in 5 minutes. Both participants are going to be limited by communicating only with emojis.
                    </span>
                    </div>

                </div>

                <Button variant="danger" size="lg" className="btnLogin" type="submit" onClick={this.onLoginPress}>
                    SIGN IN WITH GOOGLE
                </Button>
                <div>
                <Button variant="link"
                        alt="An easter egg link"
                        onClick={this.onEasterEggClick}
                        style={{
                        }}
                >the inspiration</Button>
                </div>

                {/* Dialog confirm */}
                {this.state.isOpenDialogConfirmLogout ? (
                    <div className="viewCoverScreenEE">
                        {this.renderDialogConfirmLogout()}
                    </div>
                ) : null}

                {this.state.isLoading ? (
                    <div className="viewLoading">
                        <ReactLoading
                            type={'spin'}
                            color={'#203152'}
                            height={'3%'}
                            width={'3%'}
                        />
                    </div>
                ) : null}
            </div>
        )
    }

    renderDialogConfirmLogout = () => {
        return (
            <div>
                <YouTube
                    videoId="Cv6tuzHUuuk"
                    opts={{
                        height: '390',
                        width: '640',
                        playerVars: { // https://developers.google.com/youtube/player_parameters
                            autoplay: 1,
                            start: 3,
                        }}
                    }
                />
                <div className="viewWrapButtonDialogConfirmLogoutEE">
                    <Button variant="warning" className="btnNo" onClick={this.hideDialogConfirmLogout}>
                        Close
                    </Button>
                </div>
            </div>
        )
    };

    //changes the state
    onEasterEggClick = () => {
        this.setState({
            isOpenDialogConfirmLogout: true
        })
    };

    //opposite action
    hideDialogConfirmLogout = () => {
        this.setState({
            isOpenDialogConfirmLogout: false,
        })
    };
}

export default withRouter(Home);