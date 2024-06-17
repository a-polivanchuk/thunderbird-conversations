/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from "react";
import PropTypes from "prop-types";
import { ActionButton } from "./messageActionButton.mjs";
import { messageActions } from "../../reducer/reducerMessages.mjs";
import { SvgIcon } from "../svgIcon.mjs";

/**
 * Handles display of the options menu.
 */
class OptionsMoreMenu extends React.PureComponent {
  render() {
    return React.createElement(
      "div",
      { className: "tooltip tooltip-menu menu" },
      React.createElement("div", { className: "arrow" }),
      React.createElement("div", { className: "arrow inside" }),
      React.createElement(
        "ul",
        null,
        React.createElement(
          "li",
          { className: "action-reply" },
          React.createElement(ActionButton, {
            callback: this.props.msgSendAction,
            className: "optionsButton",
            showString: true,
            type: "reply",
          })
        ),
        this.props.multipleRecipients &&
          React.createElement(
            "li",
            { className: "action-replyAll" },
            React.createElement(ActionButton, {
              callback: this.props.msgSendAction,
              className: "optionsButton",
              showString: true,
              type: "replyAll",
            })
          ),
        this.props.recipientsIncludeLists &&
          React.createElement(
            "li",
            { className: "action-replyList" },
            React.createElement(ActionButton, {
              callback: this.props.msgSendAction,
              className: "optionsButton",
              showString: true,
              type: "replyList",
            })
          ),
        React.createElement(
          "li",
          { className: "action-editNew" },
          React.createElement(ActionButton, {
            callback: this.props.msgSendAction,
            className: "optionsButton",
            showString: true,
            type: "editAsNew",
          })
        ),
        React.createElement(
          "li",
          { className: "action-forward dropdown-sep" },
          React.createElement(ActionButton, {
            callback: this.props.msgSendAction,
            className: "optionsButton",
            showString: true,
            type: "forward",
          })
        ),
        React.createElement(
          "li",
          { className: "action-archive" },
          React.createElement(ActionButton, {
            callback: this.props.msgSendAction,
            className: "optionsButton",
            showString: true,
            type: "archive",
          })
        ),
        React.createElement(
          "li",
          { className: "action-delete" },
          React.createElement(ActionButton, {
            callback: this.props.msgSendAction,
            className: "optionsButton",
            showString: true,
            type: "delete",
          })
        ),
        React.createElement(
          "li",
          { className: "action-classic" },
          React.createElement(ActionButton, {
            callback: this.props.msgSendAction,
            className: "optionsButton",
            showString: true,
            type: "classic",
          })
        ),
        React.createElement(
          "li",
          { className: "action-source" },
          React.createElement(ActionButton, {
            callback: this.props.msgSendAction,
            className: "optionsButton",
            showString: true,
            type: "source",
          })
        )
      )
    );
  }
}

OptionsMoreMenu.propTypes = {
  multipleRecipients: PropTypes.bool.isRequired,
  recipientsIncludeLists: PropTypes.bool.isRequired,
  msgSendAction: PropTypes.func.isRequired,
};

/**
 * Handles display of options in the message header.
 */
export class MessageHeaderOptions extends React.PureComponent {
  constructor(props) {
    super(props);
    this.replyAction = this.replyAction.bind(this);
    this.showDetails = this.showDetails.bind(this);
    this.displayMenu = this.displayMenu.bind(this);
    this.state = {
      expanded: false,
    };
  }

  componentWillUnmount() {
    if (this.clickListener) {
      document.removeEventListener("click", this.clickListener);
      document.removeEventListener("keypress", this.keyListener);
      document.removeEventListener("blur", this.onBlur);
      this.clickListener = null;
      this.keyListener = null;
      this.onBlur = null;
    }
  }

  replyAction(msg, event) {
    event.stopPropagation();
    event.preventDefault();

    const payload = {
      id: this.props.id,
      shiftKey: msg.shiftKey,
    };
    let action = null;
    switch (msg.type) {
      case "draft":
        action = messageActions.editDraft(payload);
        break;
      case "reply":
      case "replyAll":
      case "replyList":
        payload.type = msg.type;
        action = messageActions.reply(payload);
        break;
      case "forward":
        action = messageActions.forward(payload);
        break;
      case "editAsNew":
        action = messageActions.editAsNew(payload);
        break;
      case "archive":
        action = messageActions.archive({ id: this.props.id });
        break;
      case "delete":
        action = messageActions.delete({ id: this.props.id });
        break;
      case "classic":
        action = messageActions.openClassic(payload);
        break;
      case "source":
        action = messageActions.openSource(payload);
        break;
      default:
        console.error("Don't know how to create an action for", msg);
    }
    this.props.dispatch(action);
  }

  showDetails(event) {
    event.preventDefault();
    event.stopPropagation();
    this.props.dispatch(
      messageActions.showMsgDetails({
        id: this.props.id,
        detailsShowing: !this.props.detailsShowing,
      })
    );
  }

  displayMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.clickListener) {
      this.clickListener = (event) => {
        this.clearMenu();
      };
      this.keyListener = (event) => {
        if (event.key == "Escape") {
          this.clearMenu();
        }
      };
      this.onBlur = (event) => {
        this.clearMenu();
      };
      document.addEventListener("click", this.clickListener);
      document.addEventListener("keypress", this.keyListener);
      document.addEventListener("blur", this.onBlur);
    }

    this.setState((prevState) => ({ expanded: !prevState.expanded }));
  }

  clearMenu() {
    this.setState({ expanded: false });
    if (this.clickListener) {
      document.removeEventListener("click", this.clickListener);
      document.removeEventListener("keypress", this.keyListener);
      document.removeEventListener("blur", this.onBlur);
      this.clickListener = null;
      this.keyListener = null;
      this.onBlur = null;
    }
  }

  render() {
    let actionButtonType = "reply";
    if (this.props.isDraft) {
      actionButtonType = "draft";
    } else if (this.props.recipientsIncludeLists) {
      actionButtonType = "replyList";
    } else if (this.props.multipleRecipients) {
      actionButtonType = "replyAll";
    }

    return React.createElement(
      "div",
      { className: "options" },
      !!this.props.attachments.length &&
        React.createElement(
          "span",
          { className: "attachmentIcon" },
          React.createElement(SvgIcon, { hash: "attachment" })
        ),
      React.createElement(
        "span",
        { className: "date" },
        React.createElement(
          "span",
          { title: this.props.fullDate },
          this.props.date
        )
      ),
      this.props.expanded &&
        React.createElement(
          "span",
          { className: "mainActionButton" },
          React.createElement(ActionButton, {
            callback: this.replyAction,
            className: "icon-link",
            type: actionButtonType,
          })
        ),
      this.props.expanded &&
        React.createElement(
          "span",
          {
            className:
              "details" + this.props.detailsShowing ? "details-hidden" : "",
          },
          React.createElement(
            "button",
            {
              className: "icon-link",
              onClick: this.showDetails,
              title: browser.i18n.getMessage(
                this.props.detailsShowing
                  ? "message.hideDetails.tooltip"
                  : "message.showDetails.tooltip"
              ),
            },
            React.createElement(SvgIcon, {
              ariaHidden: true,
              hash: this.props.detailsShowing ? "info" : "info_outline",
            })
          )
        ),
      this.props.expanded &&
        React.createElement(
          "span",
          { className: "dropDown" },
          React.createElement(
            "button",
            {
              onClick: this.displayMenu,
              className: "icon-link top-right-more",
              title: browser.i18n.getMessage("message.moreMenu.tooltip"),
            },
            React.createElement(SvgIcon, {
              ariaHidden: true,
              hash: "more_vert",
            })
          ),
          this.state.expanded &&
            React.createElement(OptionsMoreMenu, {
              recipientsIncludeLists: this.props.recipientsIncludeLists,
              msgSendAction: this.replyAction,
              multipleRecipients: this.props.multipleRecipients,
            })
        )
    );
  }
}

MessageHeaderOptions.propTypes = {
  dispatch: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  detailsShowing: PropTypes.bool.isRequired,
  expanded: PropTypes.bool.isRequired,
  fullDate: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  attachments: PropTypes.array.isRequired,
  multipleRecipients: PropTypes.bool.isRequired,
  recipientsIncludeLists: PropTypes.bool.isRequired,
  isDraft: PropTypes.bool.isRequired,
};
