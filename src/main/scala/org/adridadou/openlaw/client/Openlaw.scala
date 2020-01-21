package org.adridadou.openlaw.client

import java.time.Clock

import scala.scalajs.js.annotation.{JSExport, JSExportTopLevel}
import org.adridadou.openlaw.parser.template._
import org.adridadou.openlaw.parser.template.variableTypes._

import scala.scalajs.js
import cats.implicits._
import org.adridadou.openlaw.oracles.OpenlawSignatureProof
import org.adridadou.openlaw.parser.contract.ParagraphEdits
import org.adridadou.openlaw.result.{Failure, Result, Success}
import org.adridadou.openlaw.result.Implicits._
import org.adridadou.openlaw.values.{ContractId, TemplateParameters, TemplateTitle}
import org.adridadou.openlaw.vm.OpenlawExecutionEngine
import slogging.LazyLogging
import io.circe.parser._
import io.circe.syntax._
import org.adridadou.openlaw.OpenlawValue
import org.scalajs.dom

import scala.scalajs.js.Dictionary
import scala.scalajs.js.JSConverters._

/**
  * Created by davidroon on 05.05.17.
  */
@JSExportTopLevel("Openlaw")
object Openlaw extends LazyLogging {

  val clock: Clock = Clock.systemDefaultZone()
  val engine = new OpenlawExecutionEngine
  val markdown = new OpenlawTemplateLanguageParserService(clock)

  @JSExport
  def compileTemplate(text:String) : js.Dictionary[Any] = markdown.compileTemplate(text, clock) match {
    case Left(err) => js.Dictionary(
      "isError" -> true,
      "errorMessage" -> err.message,
      "compiledTemplate" -> js.undefined
    )
    case Right(result) => js.Dictionary(
      "isError" -> false,
      "errorMessage" -> "",
      "compiledTemplate" -> result
    )
  }

  @JSExport
  def execute(compiledTemplate:CompiledTemplate, jsTemplates:js.Dictionary[CompiledTemplate], jsParams:js.Dictionary[Any]) : js.Dictionary[Any] = {
    handleExecutionResult(engine.execute(
      compiledTemplate,
      prepareParameters(jsParams),
      prepareTemplates(jsTemplates)))
  }

  @JSExport
  def execute(compiledTemplate:CompiledTemplate, jsTemplates:js.Dictionary[CompiledTemplate], jsParams:js.Dictionary[Any], externalCallStructures:js.Dictionary[Any]) : js.Dictionary[Any] = {
    handleExecutionResult(engine.execute(
      compiledTemplate,
      prepareParameters(jsParams),
      prepareTemplates(jsTemplates),
      prepareStructures(externalCallStructures)))
  }

  @JSExport
  def executeForReview(compiledTemplate:CompiledTemplate, proofs:js.Dictionary[String], jsTemplates:js.Dictionary[CompiledTemplate], jsParams:js.Dictionary[Any], externalCallStructures:js.Dictionary[Any], contractId:js.UndefOr[String], profileAddress:js.UndefOr[String]) : js.Dictionary[Any] = {
    handleExecutionResult(engine.execute(
      compiledTemplate,
      prepareParameters(jsParams),
      prepareTemplates(jsTemplates),
      signatureProofs = proofs.flatMap({ case (email, proof) => OpenlawSignatureProof.deserialize(proof).map(Email(email).getOrThrow() -> _).toOption}).toMap,
      executions = Map(),
      prepareStructures(externalCallStructures),
      contractId.toOption.map(ContractId(_)),
      profileAddress.toOption.map(EthereumAddress(_).getOrThrow())))
  }

  @JSExport
  def resumeExecution(executionResult:OpenlawExecutionState, jsTemplates:js.Dictionary[CompiledTemplate]) : js.Dictionary[Any] = {
    handleExecutionResult(engine.resumeExecution(executionResult, prepareTemplates(jsTemplates)))
  }

  @JSExport
  def createAddress(address:js.Dictionary[String]):String = {
    AddressType.internalFormat(Address(
      formattedAddress = printAddressElement(address.get("address")),
      placeId = printAddressElement(address.get("placeId")),
      streetName = printAddressElement(address.get("streetName")),
      streetNumber = printAddressElement(address.get("streetNumber")),
      city = printAddressElement(address.get("city")),
      state = printAddressElement(address.get("state")),
      country = printAddressElement(address.get("country")),
      zipCode = printAddressElement(address.get("zipCode"))
    )).getOrThrow()
  }

  private def printAddressElement(optStr:Option[String]):String = optStr.getOrElse("n/a")

  @JSExport
  def validationErrors(result:ValidationResult):js.Array[String] = result.validationExpressionErrors.toJSArray

  @JSExport
  def validateContract(executionResult:OpenlawExecutionState):ValidationResult =
    executionResult.validateExecution.getOrThrow()

  @JSExport
  def showInForm(variable:VariableDefinition, executionResult:TemplateExecutionResult):Boolean =
    variable.varType(executionResult) match {
      case _:NoShowInForm => false
      case _ => true
    }

  @JSExport
  def isChoiceType(variable:VariableDefinition, executionResult:TemplateExecutionResult):Boolean = variable.varType(executionResult) match {
    case _:DefinedChoiceType =>
      true
    case _ =>
      variable.defaultValue
        .map(getDefaultChoices(_, variable.varType(executionResult), executionResult))
        .exists(_.nonEmpty)
  }

  @JSExport
  def isStructuredType(variable:VariableDefinition, executionResult:TemplateExecutionResult):Boolean = variable.varType(executionResult) match {
    case _:DefinedStructureType => true
    case _ => false
  }

  @JSExport
  def getChoiceValues(variable:VariableDefinition, executionResult: TemplateExecutionResult):js.Array[String] = variable.varType(executionResult) match {
    case choice:DefinedChoiceType =>
      choice.choices.values.toJSArray
    case _ =>
      variable.defaultValue.map(getDefaultChoices(_, variable.varType(executionResult), executionResult)).getOrElse(Seq()).toJSArray
  }

  private def getDefaultChoices(parameter:Parameter, variableType:VariableType, executionResult: TemplateExecutionResult):Seq[String] = parameter match {
    case Parameters(parameterMap) =>
      parameterMap.toMap.get("options").map({
        case ListParameter(params) =>
          params.flatMap(_.evaluate(executionResult).getOrThrow()).map(variableType.internalFormat(_).getOrThrow())
        case OneValueParameter(expr) =>
          expr.evaluate(executionResult).getOrThrow().map(variableType.internalFormat(_).getOrThrow()).toSeq
        case _ => Seq()
      }).getOrElse(Seq())
    case _ => Seq()
  }

  @JSExport
  def getStructureFieldDefinitions(variable:VariableDefinition, executionResult: TemplateExecutionResult):js.Array[VariableDefinition] = variable.varType(executionResult) match {
    case structure:DefinedStructureType =>
      structure.structure.names.map(name => structure.structure.typeDefinition(name)).toJSArray
    case _ => Seq().toJSArray
  }

  @JSExport
  def getStructureFieldValue(variable:VariableDefinition, field:VariableDefinition, structureValue:js.UndefOr[String], executionResult: TemplateExecutionResult):js.UndefOr[String] = variable.varType(executionResult) match {
    case structureType:DefinedStructureType =>
      val values:Map[VariableName, OpenlawValue] = structureValue.map(structureType.cast(_, executionResult).getOrThrow().underlying).getOrElse(Map())
      (for {
        value <- values.get(field.name)
        fieldType <- structureType.structure.typeDefinition.get(field.name)
      } yield fieldType.varType(executionResult).internalFormat(value).getOrThrow()).orUndefined

    case _ =>
      js.undefined
  }

  @JSExport
  def setStructureFieldValue(variable:VariableDefinition, fieldName:String, fieldValue:js.UndefOr[String], structureValue:js.UndefOr[String], executionResult: TemplateExecutionResult):js.UndefOr[String] = variable.varType(executionResult) match {
    case structure:DefinedStructureType =>
      structure.structure.typeDefinition.get(VariableName(fieldName)) match {
        case Some(fieldType) =>
          val currentMap = structureValue.map(structure.cast(_, executionResult).getOrThrow().underlying).getOrElse(Map())
          fieldValue.toOption match {
            case Some(value) =>
              val newMap = currentMap + (VariableName(fieldName) -> fieldType.cast(value, executionResult).getOrThrow())
              structure.internalFormat(newMap).getOrThrow()
            case None =>
              val newMap = currentMap - VariableName(fieldName)
              structure.internalFormat(newMap).getOrThrow()
          }
        case None =>
          structureValue
      }
    case _ =>
      structureValue
  }

  @JSExport
  def getAddress(json:String):Address = AddressType.cast(json).getOrThrow()

  @JSExport
  def getFormattedAddress(address:Address):String = address.formattedAddress

  @JSExport
  def noIdentity(result:ValidationResult):Boolean = result.identities.isEmpty

  @JSExport
  def missingIdentities(result:ValidationResult):Boolean = result.missingIdentities.nonEmpty

  @JSExport
  def hasMissingInputs(result:ValidationResult):Boolean = result.missingInputs.nonEmpty

  @JSExport
  def getMissingInputs(result:ValidationResult):js.Array[String] = result.missingInputs.map(_.name).distinct.toJSArray

  @JSExport
  def missingAllIdentities(result:ValidationResult):Boolean = result.identities.nonEmpty && result.missingIdentities.length === result.identities.length

  @JSExport
  def deserializeExecutionResult(resultJson:String):SerializableTemplateExecutionResult = decode[SerializableTemplateExecutionResult](resultJson) match {
    case Right(value) => value
    case Left(ex) => throw new RuntimeException(ex.getMessage)
  }

  @JSExport
  def serializeExecutionResult(executionResult:OpenlawExecutionState):String = executionResult.toSerializable.asJson.noSpaces

  private def handleExecutionResult(executionResult:Result[OpenlawExecutionState]):js.Dictionary[Any] = executionResult match {
    case Success(result) =>
      result.state match {
        case ExecutionFinished =>
          js.Dictionary(
            "executionResult" -> result,
            "isError" -> false,
            "missingTemplate" -> false,
            "errorMessage" -> "")
        case ExecutionWaitForTemplate(_, definition, _) =>
          js.Dictionary(
            "executionResult" -> result,
            "isError" -> false,
            "missingTemplate" -> true,
            "missingTemplateName" -> definition.name.title,
            "errorMessage" -> s"the template ${definition.name} was not loaded")
        case _ =>
          js.Dictionary(
            "executionResult" -> result,
            "isError" -> true,
            "missingTemplate" -> false,
            "errorMessage" -> s"invalid end state ${result.state}")
      }
    case Failure(_, message) =>
      js.Dictionary(
        "executionResult" -> js.undefined,
        "isError" -> true,
        "errorMessage" -> message)
  }

  @JSExport
  def getInitialParameters(executionResult:TemplateExecutionResult):js.Array[js.Dictionary[String]] = {
    executionResult.getAllVariables
      .filter({
        case (_, variable) => variable.varType(executionResult) match {
          case _:NoShowInForm => false
          case _ => true
        }}).filter({case (_, variable) => variable.defaultValue.isDefined})
      .map({ case (result, variable) => js.Dictionary(
        "name" -> variable.name.name,
        "value" -> getInitialParameter(variable, result))
      }).toJSArray
  }

  private def getInitialParameter(variable:VariableDefinition, executionResult: TemplateExecutionResult):String =
    variable.defaultValue
      .map(variable.varType(executionResult).construct(_, executionResult))
      .map({
        case Success(Some(value)) => variable.varType(executionResult).internalFormat(value).getOrThrow()
        case Success(None) => ""
        case Failure(ex, message) =>
          logger.error(message, ex)
          ""
      }).getOrElse("")


  @JSExport
  def getType(variable:VariableDefinition):String = variable.variableTypeDefinition.map(_.name).getOrElse(TextType.name)

  @JSExport
  def getDescription(variable:VariableDefinition):String = variable.description.getOrElse(variable.name.name)

  @JSExport
  def getName(variable:VariableDefinition):String = variable.name.name

  @JSExport
  def getTemplateName(templateDefinition: TemplateDefinition):String = templateDefinition.name.name.title

  @JSExport
  def getCleanName(variable:VariableDefinition):String = variable.name.name.replace(" ", "-")

  @JSExport
  def renderForReview(agreement:StructuredAgreement, jsOverriddenParagraphs:js.Dictionary[String]): String =
    render(agreement, List(), jsOverriddenParagraphs, markdown.forReview)

  @JSExport
  def renderForPreview(agreement:StructuredAgreement, hiddenVariables:js.Array[String], jsOverriddenParagraphs:js.Dictionary[String]): String =
    render(agreement, hiddenVariables.toList, jsOverriddenParagraphs, markdown.forPreview)

  @JSExport
  def parseMarkdown(str:String):String = markdown.forReviewParagraph(str).getOrThrow()

  @JSExport
  def renderParagraphForEdit(agreement: StructuredAgreement, index:Int): String =
    markdown.forReviewEdit(agreement.paragraphs(index - 1))

  private def render(agreement:StructuredAgreement, hiddenVariables:List[String], jsOverriddenParagraphs:js.Dictionary[String], renderFunc:(StructuredAgreement, ParagraphEdits, List[String]) => String):String =
    renderFunc(agreement, prepareParagraphs(agreement, jsOverriddenParagraphs), hiddenVariables)

  @JSExport
  def checkValidity(variable:VariableDefinition, optValue:js.UndefOr[String], executionResult: TemplateExecutionResult): js.Dictionary[Any] = optValue.toOption
    .map(variable.varType(executionResult).cast(_, executionResult)) match {
    case Some(Failure(_ ,message)) =>
      Dictionary(
        "isError" -> true,
        "errorMessage" -> message
      )

    case _ =>
      Dictionary(
        "isError" -> false
      )
  }

  @JSExport
  def getTypes:js.Array[String] =
    js.Array(VariableType.allTypes().map(_.name):_*)

  @JSExport
  def getExecutedVariables(executionResult:TemplateExecutionResult, jsDefinedValues:js.Dictionary[Any]): js.Array[VariableDefinition] = {
    getVariables(executionResult, executionResult.getExecutedVariables, prepareParameters(jsDefinedValues)).toJSArray
  }

  @JSExport
  def getVariables(executionResult:TemplateExecutionResult, jsDefinedValues:js.Dictionary[Any]): js.Array[VariableDefinition] = {
    getVariables(executionResult, executionResult.getAllVariableNames, prepareParameters(jsDefinedValues)).toJSArray
  }

  @JSExport
  def getAllConditionalVariableNames(executionResult:TemplateExecutionResult): js.Array[String] = {
    executionResult.getAllVariables
      .map({ case (_, variable) => variable})
      .filter(_.variableTypeDefinition === Some(VariableTypeDefinition(YesNoType.name)))
      .map(variable => variable.name.name).distinct.toJSArray
  }

  def getVariables(executionResult: TemplateExecutionResult, variables: Seq[VariableName], definedValues:TemplateParameters): Seq[VariableDefinition] = {
    val predefinedVariables = definedValues.params.keys.toSet
    variables
      .flatMap(name => executionResult.getVariable(name))
      .filter(_.varType(executionResult) match {
        case _:NoShowInForm => false
        case _ => true
      })
      .filter(variable => !predefinedVariables.contains(variable.name))
  }

  @JSExport
  def getAgreements(executionResult: TemplateExecutionResult):js.Array[js.Dictionary[Any]] =
    executionResult.agreements.map(agreement => {
      executionResult.findExecutionResult(agreement.executionResultId) match {
        case Some(agreementExecutionResult) =>
          Dictionary[Any](
            "agreement" -> agreement,
            "executionResult" -> agreementExecutionResult,
            "mainTemplate" -> agreement.mainTemplate,
            "showTitle" -> agreement.header.shouldShowTitle,
            "name" -> agreement.name,
            "title" -> agreement.title.title
          )
        case None =>
          dom.console.log(s"error! execution result with id ${agreement.executionResultId.id} not found!. available: ${executionResult.subExecutions.values.map(_.id.id).mkString(",")}")
          Dictionary[Any](
            "agreement" -> agreement,
            "mainTemplate" -> agreement.mainTemplate,
            "showTitle" -> agreement.header.shouldShowTitle,
            "name" -> agreement.name,
            "title" -> agreement.title.title
          )
      }

    }).toJSArray

  @JSExport
  def createExternalSignatureValue(userId:js.UndefOr[String], email: String, serviceName: String):String =
    ExternalSignatureType.internalFormat(ExternalSignature(Option(createIdentity(userId, email)), ServiceName(serviceName))).getOrThrow()

  @JSExport
  def getIdentityEmail(identity:Identity):String = identity.email.email

  @JSExport
  def createIdentityInternalValue(userId:js.UndefOr[String], email:String):String =
    IdentityType.internalFormat(createIdentity(userId, email)).getOrThrow()

  @JSExport
  def createIdentity(userId:js.UndefOr[String], email:String):Identity = {
    Identity(
      email = Email(email).getOrThrow()
    )
  }

  @JSExport
  def getIdentities(validationResult: ValidationResult, executionResult: TemplateExecutionResult):js.Array[VariableDefinition] = {
    executionResult
      .getVariables(IdentityType, ExternalSignatureType)
      .map({case (_,variable) => variable.name -> variable})
      .toMap.values
      .filter(variable => validationResult.missingIdentities.contains(variable.name))
      .toJSArray
  }

  @JSExport
  def isSignatory(email:String, executionResult: TemplateExecutionResult):Boolean = {
    executionResult
      .getVariableValues[Identity](IdentityType)
      .getOrThrow()
      .exists(_.email.email === email) ||
      executionResult
        .getVariableValues[ExternalSignature](ExternalSignatureType)
        .getOrThrow()
        .exists(_.identity.exists(id => id.email.email === email))
  }

  @JSExport
  def getSections(document:TemplateExecutionResult):js.Array[String] = document.variableSectionList.toJSArray

  @JSExport
  def getVariableSections(document:TemplateExecutionResult):js.Dictionary[js.Array[String]] = document.sections
    .map({case (key,variables) => key -> variables.map(_.name).toJSArray}).toJSDictionary

  @JSExport
  def isDeal(template:CompiledTemplate):Boolean = template match {
    case _:CompiledDeal => true
    case _ => false
  }

  @JSExport
  def isHidden(variableDefinition: VariableDefinition):Boolean = variableDefinition.isHidden

  @JSExport
  def getCollectionSize(variable:VariableDefinition, value:String, executionResult: TemplateExecutionResult):Int =
    getCollection(variable, executionResult, value).size

  @JSExport
  def createVariableFromCollection(variable:VariableDefinition, index:Int, executionResult: TemplateExecutionResult):VariableDefinition =
    variable.varType(executionResult) match {
      case collectionType:CollectionType =>
        VariableDefinition(VariableName(variable.name.name + "_" + index), variableTypeDefinition = Some(VariableTypeDefinition(collectionType.typeParameter.name)), description = Some(getDescription(variable)))

      case _ =>
        throw new RuntimeException(s"add element to collection only works for a variable of type Collection, not '${variable.varType(executionResult).name}'")
    }

  @JSExport
  def addElementToCollection(variable:VariableDefinition, value:String, executionResult: TemplateExecutionResult):String = {
    val collection = getCollection(variable, executionResult, value)
    collection.collectionType.internalFormat(collection.copy(size = collection.size + 1)).getOrThrow()
  }

  @JSExport
  def setElementToCollection(optValue:js.UndefOr[String], index:Int, variable:VariableDefinition, collectionValue:String, executionResult: TemplateExecutionResult): String = {
    val collection = getCollection(variable, executionResult, collectionValue)
    optValue.toOption match {
      case Some(value) =>
        val openlawValue = collection.castValue(value, executionResult).getOrThrow()
        val values: Map[Int, OpenlawValue] = collection.values ++ Map(index -> openlawValue)
        collection.collectionType.internalFormat(collection.copy(values = values)).getOrThrow()
      case None =>
        collection.collectionType.internalFormat(collection.copy(values = collection.values - index)).getOrThrow()
    }
  }

  @JSExport
  def removeElementFromCollection(index:Int, variable:VariableDefinition, executionResult: TemplateExecutionResult, value:String):String = {
    val collection = getCollection(variable, executionResult, value)

    val newValues = (collection.values - index).map({
      case (key,v) if key < index => key -> v
      case (key,v) => (key - 1) -> v
    })

    collection.collectionType.internalFormat(collection
      .copy(values = newValues, size = Math.max(collection.size - 1, 0))
    ).getOrThrow()
  }

  @JSExport
  def getCollectionElementValue(variable:VariableDefinition, executionResult: TemplateExecutionResult, value:String, index:Int):String = {
    val collection = getCollection(variable, executionResult, value)
    collection.values.get(index)
      .map(collection.valueInternalFormat(_).getOrThrow())
      .getOrElse("")
  }

  @JSExport
  def getCollectionValue(variable:VariableDefinition, executionResult: TemplateExecutionResult, value:String):String = {
    val collection = getCollection(variable, executionResult, value)
    CollectionType(collection.collectionType).internalFormat(collection).getOrThrow()
  }

  private def getCollection(variable:VariableDefinition, executionResult: TemplateExecutionResult, value:String):CollectionValue = {
    variable.varType(executionResult) match {
      case collectionType:CollectionType =>
        if(value.isEmpty) {
          CollectionValue(collectionType = collectionType)
        } else {
          VariableType.convert[CollectionValue](collectionType.cast(value, executionResult).getOrThrow()).getOrThrow()
        }
      case _ =>
        throw new RuntimeException(s"add element to collection only works for a variable of type Collection, not '${variable.varType(executionResult).name}'")
    }
  }

  private def prepareParameters(jsParams:js.Dictionary[Any]):TemplateParameters = {
    val keys = jsParams.keys.toSeq
    val dynParams = jsParams.asInstanceOf[js.Dynamic]

    val params = keys
      .map(key => key -> dynParams.selectDynamic(key))
      .filter({case (_,value) => !js.isUndefined(value)})
      .map({case (key,value) => VariableName(key) -> value.toString})

    TemplateParameters(params.toMap)
  }

  private def prepareParagraphs(agreement:StructuredAgreement, jsParagraphs:js.Dictionary[String]):ParagraphEdits = {
    if(js.isUndefined(jsParagraphs)){
      ParagraphEdits()
    }else{
      val edits = agreement.paragraphs.indices
        .flatMap(index => jsParagraphs.get(index.toString).map(index -> _)).toMap

      ParagraphEdits(edits)
    }
  }

  private def prepareTemplates(jsTemplates: js.Dictionary[CompiledTemplate]): Map[TemplateSourceIdentifier, CompiledTemplate] = {
    jsTemplates.map({ case (name, template) => TemplateSourceIdentifier(TemplateTitle(name)) -> template}).toMap
  }

  private def prepareStructures(externalCallStructures: Dictionary[Any]): Map[ServiceName, IntegratedServiceDefinition] = {
    val dynParams = externalCallStructures.asInstanceOf[js.Dynamic]
    externalCallStructures
      .keys
      .toSeq
      .map(key => key -> dynParams.selectDynamic(key))
      .filter({case (_,value) => !js.isUndefined(value)})
      .map({case (key,value) => ServiceName(key) -> value.toString})
      .toMap
      .map({
        case (serviceName, jsonAbi) =>
          val abi = decode[IntegratedServiceDefinition](jsonAbi).toOption
          serviceName -> abi.toResult(s"Missing or invalid abi for external service <$serviceName>, abi: <${jsonAbi}>").getOrThrow()
      })
  }
}
