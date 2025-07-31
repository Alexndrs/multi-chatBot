/**
 * @fileoverview Types for conversation and user API
 */

/**
 * @typedef {object} User
 * @property {string} userId - Unique identifier for the user
 * @property {string} name - Name of the user
 * @property {string} email - Email address of the user
 * @property {string} password - Hashed password of the user
 * @property {Object} preferences - User preferences
 * @property {boolean} isVerified - Whether the user is verified
 */



/**
 * @typedef {object} Message
 * @property {string} msgId - Unique identifier for the message
 * @property {string} convId - Conversation ID to which the message belongs
 * @property {string} role - Role of the message sender (e.g., 'user', 'assistant')
 * @property {string} author - Author of the message (e.g : userId or model name)
 * @property {string} content - Content of the message
 * @property {string} timestamp - Timestamp of the message 
 * @property {string} token - Token associated with the message
 * @property {string} historyToken - History token associated with the message
 */

/**
 * @typedef {object} Conversation
 * @property {string} convId - Unique identifier for the conversation
 * @property {string} userId - ID of the user who owns the conversation
 * @property {string} convName - Title of the conversation
 * @property {string} date - Date of last update
 * @property {number} token - Total number of tokens used in the conversation
 * 
 * 
 * The messages of the conversation are stored separately with a table [parentId <-> childId] that allows to have non-linear conversations.
 * 
 * 
 */


/**
 * @typedef {object} MessageWithRelations
 * @property {Message} message - The message object
 * @property {string[]} parents - Array of parent message IDs
 * @property {string[]} children - Array of child message IDs
 */

/**
 * @typedef {object} Graph
 * @property {string[]} rootId - Array of root message IDs
 * @property {Record<string, MessageWithRelations>} messagesMap - Object mapping message IDs to their relations
 * 
 */
