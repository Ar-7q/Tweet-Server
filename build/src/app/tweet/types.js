"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = "#graphql\n    input CreateTweetData {\n        content:String!\n        imageURL:String\n    }\n\n    type Tweet {\n        id:ID!\n        content:String!\n        imageURL:String\n        author:User\n    }\n";
