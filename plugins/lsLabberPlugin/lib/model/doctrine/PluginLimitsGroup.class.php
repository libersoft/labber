<?php

/**
 * LimitsGroup
 * 
 * This abstract class Pluginhas been auto-generated by the Doctrine ORM Framework
 * 
 * @package    pHlab
 * @subpackage model
 * @author     LiberSoft <info@libersoft.it>
 * @version    SVN: $Id: Builder.php 7490 2010-03-29 19:53:27Z jwage $
 */
abstract class PluginLimitsGroup extends BaseLimitsGroup
{
  public function getOfficialName()
  {
    return $this->getCertifiedName() ?: $this->getName();
  }
}
