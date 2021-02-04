<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* __string_template__0b495737a3474837e3c2f8117d5f4e3cfaa11a5a3cd4cda66fb6d892e7d13766 */
class __TwigTemplate_ac33a5e97dae6a30ac869c0eac029c25be1a9aa4525bd6e3d8c79216df0e5987 extends \Twig\Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $this->checkSecurity();
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 1
        echo "<div class=\"container-fluid\">
    <div class=\"row\">
        <div class=\"col-12 mt-3\">
            <div class=\"card\">
                <div class=\"card-horizontal\">
                    <div class=\"img-square-wrapper\">
                        ";
        // line 7
        echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["field_teaser_media"] ?? null), 7, $this->source), "html", null, true);
        echo "
                    </div>
                    <div class=\"card-body\">
                        <h4 class=\"card-title\">";
        // line 10
        echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["title"] ?? null), 10, $this->source), "html", null, true);
        echo "</h4>
                        <p class=\"card-text\">";
        // line 11
        echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["field_teaser"] ?? null), 11, $this->source), "html", null, true);
        echo "</p>
                    </div>
                </div>
 <!--               <div class=\"card-footer\">
                    <small class=\"text-muted\">Last updated 3 mins ago</small>
                </div> -->
            </div>
        </div>
    </div>
</div>";
    }

    public function getTemplateName()
    {
        return "__string_template__0b495737a3474837e3c2f8117d5f4e3cfaa11a5a3cd4cda66fb6d892e7d13766";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  57 => 11,  53 => 10,  47 => 7,  39 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "__string_template__0b495737a3474837e3c2f8117d5f4e3cfaa11a5a3cd4cda66fb6d892e7d13766", "");
    }
    
    public function checkSecurity()
    {
        static $tags = array();
        static $filters = array("escape" => 7);
        static $functions = array();

        try {
            $this->sandbox->checkSecurity(
                [],
                ['escape'],
                []
            );
        } catch (SecurityError $e) {
            $e->setSourceContext($this->source);

            if ($e instanceof SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

    }
}
