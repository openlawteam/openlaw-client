import org.adridadou.openlaw.client.Openlaw
import org.adridadou.openlaw.parser.template.{CompiledTemplate, TemplateExecutionResult}
import org.adridadou.openlaw.vm.OpenlawExecutionEngine
import org.scalatest.{FlatSpec, Matchers}

 import scala.scalajs.js.Dictionary

 /**
  * Created by davidroon on 09.06.17.
  */
class OpenlawTest extends FlatSpec with Matchers {

   val engine = new OpenlawExecutionEngine

   "Openlaw" should "compile a template and execute" in {
    val result = Openlaw.compileTemplate("[[var:Text]]")
    result.get("isError") shouldBe Some(false)
    result.get("errorMessage") shouldBe Some("")
    result.get("compiledTemplate") match {
      case Some(template:CompiledTemplate) =>
        val result2 = Openlaw.execute(template, Dictionary(), Dictionary("var" -> "hello"))
        result2.get("isError") shouldBe Some(false)
        result2.get("missingTemplate") shouldBe Some(false)
        result2.get("errorMessage") shouldBe Some("")
        result2.get("executionResult") match {
          case Some(executionResult:TemplateExecutionResult) =>
            executionResult.getVariables.map(_.name) shouldBe Seq("var")
        }
      case None =>
        fail("template not found")
    }
  }

   it should "give the initial parameters for each variable" in {
    val result = Openlaw.compileTemplate("[[var:Text('hello')]]")
    result.get("compiledTemplate") match {
      case Some(template:CompiledTemplate) =>
        val result2 = Openlaw.execute(template, Dictionary(), Dictionary())
        result2.get("executionResult") match {
          case Some(executionResult:TemplateExecutionResult) =>
            executionResult.getVariables.map(_.name) shouldBe Seq("var")
            val initialValues = Openlaw.getInitialParameters(executionResult).map(_.toMap).toSeq
            initialValues shouldBe Seq(Map("name" -> "var", "value" -> "hello"))
          case None =>
            fail("template not found")
        }
      case None =>
        fail("template not found")
    }
  }

   it should "give the initial parameters for each variable even in a deal" in {
    for {
      template1 <- Openlaw.compileTemplate("[[var:Text('hello')]]").get("compiledTemplate")
      template2 <- Openlaw.compileTemplate("[[var2:Text('world')]]").get("compiledTemplate")
      template3 <- Openlaw.compileTemplate("[[template:Template('template')]][[template2:Template('template')]]").get("compiledTemplate")
    } {
      Openlaw.execute(template3.asInstanceOf[CompiledTemplate], Dictionary(
        "template" -> template1.asInstanceOf[CompiledTemplate],
        "template2" -> template2.asInstanceOf[CompiledTemplate]
      ), Dictionary()).get("executionResult") match {
        case Some(executionResult:TemplateExecutionResult) =>
          Openlaw.getInitialParameters(executionResult).map(_.toMap).toSeq shouldBe Seq(
            Map("name" -> "template", "value" -> "{\"name\":\"template\"}"), Map("name" -> "var", "value" -> "hello"), Map("name" -> "template2", "value" -> "{\"name\":\"template\"}"), Map("name" -> "var", "value" -> "hello"), Map("name" -> "var", "value" -> "hello")
          )
        case None => fail("execution result not found")
      }
    }
  }
} 
