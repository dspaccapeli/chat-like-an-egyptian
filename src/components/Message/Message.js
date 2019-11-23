import React, { Component } from 'react'
import ReactLoading from 'react-loading'
import { withRouter } from 'react-router-dom'
import { myFirebase, myFirestore } from '../../config'

import './Message.css'

import { AppString } from '../../constants/AppString'
import ChatBoard from './../ChatBoard/ChatBoard'
import WelcomeBoard from '../WelcomeBoard/WelcomeBoard'

import Button from 'react-bootstrap/Button'

class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isOpenDialogConfirmLogout: false,
            currentPeerUser: null
        };

        this.currentUserId = localStorage.getItem(AppString.ID);
        this.currentUserNickname = localStorage.getItem(AppString.NICKNAME);

        this.listUser = []
    }

    componentDidMount() {
        //check that the user is logged in as soon as you load the component [1]
        this.checkLogin();
    }

    checkLogin = () => {
        if (!localStorage.getItem(AppString.ID)) {
            this.setState({ isLoading: false }, () => {
                //manages session history by pushing the route '/'
                this.props.history.push('/');
            })
        } else {
            //call async func to get the list of _connected_ users
            //this.getListUser();
            this.getListRoom();
        }
    };

    //behaves as a sequential component while being timed
    getListUser = async () => {
        //get the list of _documents_ (user identifiers) from the collection _AppString.NODE_USERS_ (='users')
        const result = await myFirestore.collection(AppString.NODE_USERS).get();
        if (result.docs.length > 0) {
            this.listUser = [...result.docs];
            this.setState({ isLoading: false })
        }
    };

    getListRoom = async () => {

        const result = await myFirestore.collection(AppString.NODE_ROOMS).get();

        // let newRoomId = this.currentUserId;
        let newRoomId = "-1";
        let grtRoomId = 0;

        if (result.docs.length === 0) {
            myFirestore
                .collection(AppString.NODE_ROOMS)
                .doc("0")
                .set({
                    size: 1,
                })
                .then(data => {
                    // Write user info to local
                    this.setState({
                        currentPeerUser: "0",
                        isLoading: false,
                    })

                });

            return null;

        } else {
            result.docs.forEach((rooms)=>{
                if (rooms.data().size === 1){
                    newRoomId = rooms.id;
                }
                if (parseInt(rooms.id) >= grtRoomId) {
                    grtRoomId = parseInt(rooms.id);
                }
            });

            if (newRoomId !== "-1"){
                myFirestore
                    .collection(AppString.NODE_ROOMS)
                    .doc(newRoomId)
                    .set({
                        size: 2,
                    })
                    .then(data => {
                        // Write user info to local
                        this.setState({
                            currentPeerUser: newRoomId,
                            isLoading: false,
                        })

                    })
            } else {
                myFirestore
                    .collection(AppString.NODE_ROOMS)
                    .doc(String(grtRoomId + 1))
                    .set({
                        size: 1,
                    })
                    .then(data => {
                        // Write user info to local
                        this.setState({
                            currentPeerUser: String(grtRoomId + 1),
                            isLoading: false,
                        })

                    })
            }
        }
    };


    //changes the state
    onLogoutClick = () => {
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

    //manages the logout flow
    doLogout = () => {
        //set the component status to preloading
        this.setState({ isLoading: true });
        myFirebase
            .auth()
            .signOut()
            .then(() => {
                /*
                    clear the localStorage which holds many
                    strings related to the user and app
                */
                this.setState({ isLoading: false }, () => {
                    localStorage.clear();
                    this.props.showToast(1, 'شالوم');
                    this.props.history.push('/')
                })
            })
            .catch(function(err) {
                this.setState({ isLoading: false });
                this.props.showToast(0, err.message)
            })
    };

    renderListUser = () => {
        if (this.listUser.length > 0) {
            let viewListUser = [];
            this.listUser.forEach((item, index) => {
                if (item.data().id !== this.currentUserId) {
                    viewListUser.push(
                        <button
                            className={
                                this.state.currentPeerUser &&
                                this.state.currentPeerUser.id === item.data().id
                                    ? 'viewWrapItemFocused'
                                    : 'viewWrapItem'
                            }
                            key={item.data().id}
                            onClick={() => {
                                this.setState({ currentPeerUser: item.data() })
                            }}
                        >
                            {/*
                            <img
                                className="viewAvatarItem"
                                src={item.data().photoUrl}
                                alt="icon avatar"
                            />
                            */}
                            <div className="viewWrapContentItem">
                                <span className="textItem">{`Nickname: ${item.data().nickname}`}</span>
                            </div>
                        </button>
                    )
                }
            });
            return viewListUser;
        } else {
            return null;
        }
    };

    render() {
        return (
            <div className="root">
                {/* Header */}
                <div className="header">
                    <span>
                        <span role="img" aria-label="palm">🌴</span>
                        Chat Like an Egyptian
                        <span role="img" aria-label="camel">🐪</span>
                    </span>
                    <Button
                        variant="outline-danger"
                        alt="An icon logout"
                        onClick={this.onLogoutClick}
                        style={{
                            float: "right"
                        }}
                    >Logout</Button>
                </div>

                {/* Body */}
                <div className="body">
                    {/* HIDE THIS */}
                    <div className="viewListUser"> {this.renderListUser()}</div>
                    <div className="viewBoard">
                        {this.state.currentPeerUser ? (
                            <ChatBoard
                                currentPeerUser={this.state.currentPeerUser}
                                showToast={this.props.showToast}
                            />
                        ) : (
                            <WelcomeBoard
                                currentUserNickname={this.currentUserNickname}
                            />
                        )}
                    </div>
                </div>

                {/* Dialog confirm */}
                {this.state.isOpenDialogConfirmLogout ? (
                    <div className="viewCoverScreen">
                        {this.renderDialogConfirmLogout()}
                    </div>
                ) : null}

                {/* Loading */}
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
                <div className="titleDialogConfirmLogout">Are you sure you want to logout?</div>
                <div className="viewWrapButtonDialogConfirmLogout">
                    <Button className="btnYes" onClick={this.doLogout}>
                        Yes
                    </Button>
                    <Button variant="warning" className="btnNo" onClick={this.hideDialogConfirmLogout}>
                        Not really
                    </Button>
                </div>
            </div>
        )
    }
}

export default withRouter(Message);