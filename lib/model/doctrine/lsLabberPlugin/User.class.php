<?php

/**
 * User
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @package    Labber
 * @subpackage model
 * @author     LiberSoft <info@libersoft.it>
 * @version    SVN: $Id: Builder.php 7490 2010-03-29 19:53:27Z jwage $
 */
class User extends PluginUser
{
  public function getFullName()
  {
    return sprintf('%s %s', $this->name, $this->surname);
  }
}
