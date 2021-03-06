'use strict';

import * as vscode from 'vscode';
import * as irc from 'irc';

export default class IrcDocument {

	private _uri: vscode.Uri;
	private _emitter: vscode.EventEmitter<vscode.Uri>;
	private _lines: string[];
	private _client: irc.Client;

	constructor(uri: vscode.Uri, emitter: vscode.EventEmitter<vscode.Uri>, ircClient: irc.Client) { 
	
		this._uri = uri;
		this._emitter = emitter;
		this._client = ircClient; 
		this._lines = [];

		// Add listeners to this client for a number of events
		this._client.addListener('error', this.pushLineError.bind(this));
		this._client.addListener('motd', this.pushLineMotd.bind(this));
		this._client.addListener('names', this.pushLineNames.bind(this));
		this._client.addListener('message', this.pushLineMessage.bind(this));
		this._client.addListener('selfMessage', this.pushLineSelfMessage.bind(this)); 
		this._client.addListener('join', this.pushLineJoin.bind(this));
		this._client.addListener('part', this.pushLinePart.bind(this));
	}

	private pushLineError(message) {
		this._lines.push('Error: ' + message.command);
		this._emitter.fire(this._uri);
	}

	private pushLineMotd(motd) {
		this._lines.push(motd);
		this._emitter.fire(this._uri);
	}

	private pushLineNames(channel, nicks) {
		var names = ('Users on ' + channel + ': ');
		for (let nick in nicks) {
			names += (nicks[nick] + nick) + ' ';
		}
		this._lines.push(names);
		this._emitter.fire(this._uri);
	}

	private pushLineMessage(from, to, message) {
		this._lines.push('<'+from+'>' + ' ' + message);
		this._emitter.fire(this._uri);
	}

	private pushLineSelfMessage(to, message) {
		this._lines.push('<'+this._client.nick+'>' + ' ' + message); 
		this._emitter.fire(this._uri); 
	}

	private pushLineJoin(channel, nick, message) {
		this._lines.push(nick + ' has joined channel ' + channel);
		this._emitter.fire(this._uri);
	}

	private pushLinePart(channel, nick, reason, message) {
		this._lines.push(nick + ' has left channel ' + channel + ' (reason: ' + reason +')');
		this._emitter.fire(this._uri);
	}

	get value() {
		return this._lines.join('\n');
	}
}
