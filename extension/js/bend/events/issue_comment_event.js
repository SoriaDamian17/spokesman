/**
 * Created by Nahuel Barrios on 29/12/15.
 */
var spk = spk || {};
spk.events = spk.events || {};

spk.events.issueCommentEvent = (function () {

    var parseGitHubEvent = function (event) {
        return {
            action: event.payload.action
            , text: event.payload.comment.body
            , link: event.payload.comment.html_url
            , issue: {
                number: event.payload.issue.number
                , title: event.payload.issue.title
            }
        };
    };

    var buildNotification = function (dto) {
        var result;
        var icon;
        var issueType;

        var mergedActions = dto.payload.action.split('+');
        if (mergedActions.length > 1) {

            var mergedTypes = dto.type.split('+');
            if (mergedTypes[1] === 'IssuesEvent') {
                // i.e.: Issue closed w/comment by @barriosnahuel

                if (mergedActions[1] === 'closed') {
                    icon = 'img/events/issue-closed+commented.png';
                } else if (mergedActions[1] === 'reopened') {
                    icon = 'img/events/issue-opened+commented.png';
                } else {
                    console.error('Error merging actions. Can\'t create icon for IssueCommentEvent w/ action %s', mergedActions[1]);
                }

                issueType = 'Issue ';
            } else {
                // Then it's PullRequestEvent: PR reopened w/ comment by @barriosnahuel

                if (mergedActions[1] === 'closed') {
                    icon = 'img/events/pr-closed+commented.png';
                } else if (mergedActions[1] === 'reopened') {
                    icon = 'img/events/pr-opened+commented.png';
                } else {
                    console.error('Error merging actions. Can\'t create icon for IssueCommentEvent w/ action %s', mergedActions[1]);
                }

                issueType = 'PR ';
            }

            result = {
                title: issueType + mergedActions[1] + ' w/comment by ' + dto.actor.username
                , message: dto.payload.issue.title + ': "' + dto.payload.text + '"'
                , contextMessage: spk.util.buildNotificationContext([
                    dto.repo
                    , '#' + dto.payload.issue.number
                ])
                , icon: icon
            };

        } else {
            // This is the default IssueCommentEvent

            result = {
                title: dto.actor.username + ' said on ' + dto.payload.issue.title
                , message: '"' + dto.payload.text + '"'
                , contextMessage: spk.util.buildNotificationContext([
                    dto.repo
                    , '#' + dto.payload.issue.number
                ])
                , icon: 'img/events/comments.png'
            };
        }

        result.link = dto.payload.link;

        return result;
    };

    return {
        parse: parseGitHubEvent,
        buildNotification: buildNotification
    };
}());