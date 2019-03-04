import {PostingTemplate, getRepository} from "@loconomics/data"
import {serialize} from "class-transformer"

declare var sails: any;

module.exports = {
  friendlyName: 'Posting template lookup',
  // description: '',
  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },
  exits: {
    success: {
      outputType: 'ref'
    },
    notFound: {
      responseType: "notFound"
    }
  },
  fn: async function(inputs, exits) {
    const {id} = inputs
    const PostingTemplates = await getRepository(PostingTemplate)
    let data: any = await PostingTemplates.findOne({
      select: [
        "postingTemplateId",
        "name",
        "createdDate",
        "updatedDate",
        "modifiedBy"
      ],
      relations: [
        "postingTemplateQuestions",
        "postingTemplateQuestions.question",
      ],
      where: {
        postingTemplateId: id,
        language: this.req.getLocale()
      }
    })
    if(!data)
      return exits.notFound()
    const questions = await data.postingTemplateQuestions
    data.questions = await Promise.all(questions.map(async (p) => {
      const question = await p.question
      console.log("Question", question)
      const questionType = await question.questionType
      console.log("type", questionType)
      return {
        questionID: question.questionId,
        questionTypeID: questionType.questionTypeId,
        question: question.question,
        label: question.label,
        helpBlock: question.helpBlock,
        options: JSON.parse(question.options),
        legend: p.legend,
        branchLogic: JSON.parse(p.branchLogic)
      }
    }))
    delete data.__postingTemplateQuestions__
    return exits.success(serialize(data))
  }
}
