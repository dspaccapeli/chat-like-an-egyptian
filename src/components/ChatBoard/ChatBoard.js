import moment from 'moment'
import React, { Component } from 'react'
import ReactLoading from 'react-loading'
import 'react-toastify/dist/ReactToastify.css'
import { myFirestore } from '../../config'
import './ChatBoard.css'
import { AppString } from '../../constants/AppString'

//import EmojiPicker from 'emoji-picker-react';
import './Chatboard.scss';

import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

//import JSEMOJI from 'emoji-js';
//import { Emoji } from 'react-emoji-render';
import { Emoji } from 'emoji-mart'

import Button from 'react-bootstrap/Button'
//import Container from 'react-bootstrap/Container'
//import Row from 'react-bootstrap/Row'
//import Col from 'react-bootstrap/Col'

/*
const jsemoji = new JSEMOJI();
// set the style to emojione (default - apple)
jsemoji.img_set = 'emojione';
// set the storage location for all emojis
jsemoji.img_sets.emojione.path = 'https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/';
jsemoji.init_env(); // else auto-detection will trigger when we first convert
jsemoji.replace_mode = 'unified';
jsemoji.allow_native = true;
*/

export default class ChatBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            inputValue: '',
            message: []
        };
        this.currentUserId = localStorage.getItem(AppString.ID);
        this.currentUserNickname = localStorage.getItem(AppString.NICKNAME);
        this.listMessage = [];
        this.currentPeerUser = this.props.currentPeerUser;
        this.groupChatId = null;
        this.removeListener = null;
    }

    componentDidUpdate() {
        this.scrollToBottom()
    }

    componentDidMount() {
        /*
            used at the moment of the first render
            it's not go through componentWillReceiveProps
        */
        this.getListHistory()
    }

    //if there's a listener then remove it
    componentWillUnmount() {
        if (this.removeListener) {
            this.removeListener()
        }
    }

    /*
        when the component updates for example when on the sidebar you refresh
        the parent states refresh the history based on the props
    */
    componentWillReceiveProps(newProps) {
        if (newProps.currentPeerUser) {
            this.currentPeerUser = newProps.currentPeerUser;
            this.getListHistory()
        }
    }

    /*
        remove/refresh the listener, it may be invoked because it
        was set up or invoked by componentWillReceiveProps
    */
    count = 0;

    getListHistory = () => {
        if (this.removeListener) {
            this.removeListener()
        }

        this.listMessage.length = 0;
        this.setState({ isLoading: true });

        /*
        if (
            this.hashString(this.currentUserId) <=
            this.hashString(this.currentPeerUser.id)
        ) {
            this.groupChatId = `${this.currentUserId}-${this.currentPeerUser.id}`
        } else {
            this.groupChatId = `${this.currentPeerUser.id}-${this.currentUserId}`
        }
        */

        this.groupChatId = this.currentPeerUser;

        //get history and listen new data added, onSnapshot=~listener
        this.removeListener = myFirestore
            .collection(AppString.NODE_MESSAGES)
            .doc(this.groupChatId)
            .collection(this.groupChatId)
            .onSnapshot(
                snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === AppString.DOC_ADDED) {
                            this.listMessage.push(change.doc.data())
                        }
                    });

                    if (true){
                        this.setState({ isLoading: false });
                        this.count+=1;
                    } else {
                        this.forceUpdate();
                    }
                },
                err => {
                    this.props.showToast(0, err.toString())
                }
            )
    };

    onSendMessage = (content, type) => {
        if (content.length === 0){
            return
        }

        let message = "";
        content.forEach((it) => {
            message += it + " ";
        });

        const timestamp = moment()
            .valueOf()
            .toString();

        const itemMessage = {
            idFrom: this.currentUserId,
            timestamp: timestamp,
            content: message.trim(),
            type: type
        };

        console.log(itemMessage);
        console.log(this.groupChatId);

        myFirestore
            .collection(AppString.NODE_MESSAGES)
            .doc(this.groupChatId)
            .collection(this.groupChatId)
            .doc(timestamp)
            .set(itemMessage)
            .then(() => {
                this.setState({ inputValue: '' })
            })
            .catch(err => {
                this.props.showToast(0, err.toString())
            })
    };

    onKeyboardPress = event => {
        if (event.key === 'Enter') {
            this.onSendMessage(this.state.inputValue, 0)
        }
    };

    scrollToBottom = () => {
        if (this.messagesEnd) {
            this.messagesEnd.scrollIntoView({})
        }
    };

    clearMessage = () => {
        this.setState({
            message: [],
        });
    };

    addToMessage = (emojiObject) => {
        let tempList = this.state.message;
        tempList.push(emojiObject.id);
        this.setState({
            message: tempList,
        });

    };

    removeFromMessage = () => {
        let tempList = this.state.message;
        tempList.pop();
        this.setState({
            message: tempList,
        });

    };

    renderEmojiList = (emojiList) => {
        let viewListMessage = [];
        if (emojiList.length > 0) {
            emojiList.forEach((item, index) => {
                //viewListMessage.push(jsemoji.replace_colons(`:${item}:`))
                let str = `:${item}:`;
                viewListMessage.push(<Emoji emoji={str} size={20} />);
            })
        }
        return viewListMessage;
    };

    stringFromList = (msgList) => {
        let list = this.renderEmojiList(msgList);
        let string = "";
        list.forEach((it)=>{
            string += it;
        });
        return {__html: string};
    };

    render() {
        return (
            <div className="viewChatBoard">

                {/* List message */}
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                }}>
                    <div className="viewListContentChat">
                        {this.renderListMessage()}
                        <div
                            style={{ float: 'left', clear: 'both' }}
                            ref={el => {
                                this.messagesEnd = el
                            }}
                        />
                    </div>

                    {/* View bottom */}
                    <div style={{
                        display: "flex",
                        flex: 1,
                        flexDirection: "column",
                    }}>
                        <div className="viewBottom">
                            {/*<div
                                style={{
                                    fontSize: "x-large",
                                    marginLeft: "40px",
                                    marginRight: "20px",
                                    textAlign: "left",
                                }}
                                className="viewInput"
                                dangerouslySetInnerHTML={this.stringFromList(this.state.message)}

                            />
                            */}
                            <div
                                className="viewInput"
                                style={{
                                    fontSize: "x-large",
                                    marginLeft: "40px",
                                    marginRight: "20px",
                                    textAlign: "left",
                                }}>

                                {this.renderEmojiList(this.state.message)}
                            </div>

                            <Button
                                onClick={this.removeFromMessage}
                                variant="secondary"
                                style={{
                                    marginRight: "10px",
                                }}>
                                Delete
                            </Button>
                            <Button
                                onClick={() => {
                                    this.onSendMessage(this.state.message, 0);
                                    this.clearMessage();
                                }}
                                style={{
                                    marginRight: "10px",
                                }}>
                                Send
                            </Button>
                        </div>
                        <div style={{
                            height: "100%",
                        }}>
                            <Picker
                                onSelect={this.addToMessage}
                                style={{
                                    width: "70%",
                                    marginTop: "30px",
                                }}
                                emojiSize={30}
                                title="Pick your emojis here"
                                showSkinTones={false}
                            />
                        </div>
                        <Button variant="link"
                                alt="questionnaire"
                                href={"https://forms.gle/JDgGDAdes7BzA3oc6"}
                                style={{
                                }}
                        >questionnaire here</Button>
                    </div>
                </div>

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

    renderListMessage = () => {
        let viewListMessage = [];
        let start = true;
        let idMsg = "";

        if (this.listMessage.length > 0) {
            this.listMessage.forEach((item, index) => {
                if (item.idFrom === this.currentUserId) {
                    // Item right (my message)
                    if (item.idFrom !== idMsg && !start){
                        viewListMessage.push(
                            <div style={{
                                display: "flex",
                                flexDirection: "row-reverse",
                                marginRight: "30px",
                            }}>Other</div>
                        )
                    }

                    if (item.type === 0) {
                        viewListMessage.push(
                            <div style={{position: "relative"}}>
                                <div className="viewItemRightYours" key={item.timestamp}>
                                    {this.renderEmojiList(item.content.split(" "))}
                                </div>
                            </div>
                        )
                    }
                    if (start){

                        start = false;
                    }
                    idMsg = item.idFrom;
                } else {

                    if (item.idFrom !== idMsg && !start){
                        viewListMessage.push(
                            <div style={{
                                display: "flex",
                                flexDirection: "row-reverse",
                                marginRight: "30px",
                            }}>You</div>
                        )
                    }

                    // Item left (peer message)
                    if (item.type === 0) {
                        viewListMessage.push(
                            <div>
                                <div className="viewItemRightOther" key={item.timestamp}>
                                    {this.renderEmojiList(item.content.split(" "))}
                                </div>
                            </div>
                        );
                    }

                    if (start){
                        start = false;
                    }
                    idMsg = item.idFrom;
                }

            });

            if (idMsg === this.currentUserId){
                viewListMessage.push(
                    <div style={{
                        display: "flex",
                        flexDirection: "row-reverse",
                        marginRight: "30px",
                    }}>You</div>
                )
            } else {
                viewListMessage.push(
                    <div style={{
                        display: "flex",
                        flexDirection: "row-reverse",
                        marginRight: "30px",
                    }}>Other</div>
                )
            }

            return viewListMessage;
        } else {
            return (
                <div className="viewWrapSayHi">
                    <span className="textSayHi">Say hi to new friend <span role="img" aria-label="hi">👋</span></span>
                </div>
            )
        }
    };
}

/*
viewListMessage.push(
    <div className="viewWrapItemLeft" key={item.timestamp}>
        <div className="viewWrapItemLeft3">
            {this.isLastMessageLeft(index) ? (
                {<img
                                            src={this.currentPeerUser.photoUrl}
                                            alt="avatar"
                                            className="peerAvatarLeft"
                                        />}
            ) : (s
                <div className="viewPaddingLeft" />
            )}
            <div className="viewItemLeft">
                <span className="textContentItem">{item.content}</span>
            </div>
        </div>
        {this.isLastMessageLeft(index) ? (
            <span className="textTimeLeft">
                                        {moment(Number(item.timestamp)).format('ll')}
                                    </span>
        ) : null}
    </div>
)


import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
<Picker style={{
                    minWidth: "100%",
                    }}
                        showPreview={"false"}
                        showSkinTones={"false"}
                        title={"Chat Like an Egyptian"}
                />


renderListMessage = () => {
        if (this.listMessage.length > 0) {
            let viewListMessage = [];
            this.listMessage.forEach((item, index) => {
                if (item.idFrom === this.currentUserId) {
                    // Item right (my message)
                    if (item.type === 0) {
                        viewListMessage.push(
                            <div className="viewItemRightYours" key={item.timestamp}>
                                <span className="textContentItem">{item.content}</span>
                            </div>
                        )
                    }
                } else {
                    // Item left (peer message)
                    if (item.type === 0) {
                        viewListMessage.push(
                            <div className="viewItemRightOther" key={item.timestamp}>
                                <span className="textContentItem">{item.content}</span>
                            </div>
                        );
                    }
                }
            });
            return viewListMessage;
        } else {
            return (
                <div className="viewWrapSayHi">
                    <span className="textSayHi">Say hi to new friend <span role="img" aria-label="hi">👋</span></span>
                </div>
            )
        }
    };

    {<EmojiPicker
                        onEmojiClick={this.addToMessage}
                        disableDiversityPicker
                    />}

    addToMessage = (emojiCode, emojiObject) => {
        let tempList = this.state.message;
        tempList.push(emojiObject.name);
        this.setState({
            message: tempList,
        });

    };

    onSendMessage = (content, type) => {
        if (content.length === 0){
            return
        }

        let message = "";
        content.forEach((it) => {
            message += it + " ";
        });

        const timestamp = moment()
            .valueOf()
            .toString();

        const itemMessage = {
            idFrom: this.currentUserId,
            idTo: this.currentPeerUser.id,
            timestamp: timestamp,
            content: message.trim(),
            type: type
        };

        console.log(itemMessage);
        console.log(this.groupChatId);

        myFirestore
            .collection(AppString.NODE_MESSAGES)
            .doc(this.groupChatId)
            .collection(this.groupChatId)
            .doc(timestamp)
            .set(itemMessage)
            .then(() => {
                this.setState({ inputValue: '' })
            })
            .catch(err => {
                this.props.showToast(0, err.toString())
            })
    };
*/