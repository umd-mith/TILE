<?php
/**
 * unicode_ord
 * 
 * Returns the unicode value of the string
 *
 * @param string $c The source string
 * @param integer $i The index to get the char from (passed by reference for use in a loop)
 * @return integer The value of the char at $c[$i]
 * @author kerry at shetline dot com
 * @author Dom Hastings - modified to suit my needs
 * @see http://www.php.net/manual/en/function.ord.php#78032
 */
function unicode_ord(&$c, &$i = 0) {
  // get the character length
  $l = strlen($c);
  // copy the offset
  $index = $i;
  
  // check it's a valid offset
  if ($index >= $l) {
    return false;
  }
  
  // check the value
  $o = ord($c[$index]);
  
  // if it's ascii
  if ($o <= 0x7F) {
    return $o;
  
  // not sure what it is...
  } elseif ($o < 0xC2) {
    return false;
  
  // if it's a two-byte character  
  } elseif ($o <= 0xDF && $index < $l - 1) {
    $i += 1;
    return ($o & 0x1F) <<  6 | (ord($c[$index + 1]) & 0x3F);
  
  // three-byte
  } elseif ($o <= 0xEF && $index < $l - 2) {
    $i += 2;
    return ($o & 0x0F) << 12 | (ord($c[$index + 1]) & 0x3F) << 6 | (ord($c[$index + 2]) & 0x3F);
    
  // four-byte
  } elseif ($o <= 0xF4 && $index < $l - 3) {
    $i += 3;
    return ($o & 0x0F) << 18 | (ord($c[$index + 1]) & 0x3F) << 12 | (ord($c[$index + 2]) & 0x3F) << 6 | (ord($c[$index + 3]) & 0x3F);
    
  // not sure what it is...
  } else {
    return false;
  }
}

/**
 * unicode_chr
 *
 * @param string $c 
 * @return string
 * @author Miguel Perez
 * @see http://www.php.net/manual/en/function.chr.php#77911
 */
function unicode_chr(&$c) {
  if ($c <= 0x7F) {
    return chr($c);
    
  } else if ($c <= 0x7FF) {
    return chr(0xC0 | $c >> 6).chr(0x80 | $c & 0x3F);
    
  } else if ($c <= 0xFFFF) {
    return chr(0xE0 | $c >> 12).chr(0x80 | $c >> 6 & 0x3F).chr(0x80 | $c & 0x3F);
    
  } else if ($c <= 0x10FFFF) {
    return chr(0xF0 | $c >> 18) . chr(0x80 | $c >> 12 & 0x3F).chr(0x80 | $c >> 6 & 0x3F).chr(0x80 | $c & 0x3F);
    
  } else {
    return false;
  }
}

/**
 * xmlentities
 * 
 * Makes the specified string XML-safe
 *
 * @param string $s
 * @param boolean $hex Whether or not to make hexadecimal entities (as opposed to decimal)
 * @return string The XML-safe result
 * @author Dom Hastings
 * @dependencies unicode_ord()
 * @see http://www.w3.org/TR/REC-xml/#sec-predefined-ent
 */
function xmlentities($s, $hex = true) {
  // if the string is empty
  if (empty($s)) {
    // just return it
    return $s;
  }
  
  // create the return string
  $r = '';
  // get the length
  $l = strlen($s);
  
  // iterate the string
  for ($i = 0; $i < $l; $i++) {
    // get the value of the character
    $o = unicode_ord($s, $i);
    
    // valid cahracters
    $v = (
      // \t \n <vertical tab> <form feed> \r
      ($o >= 9 && $o <= 13) || 
      // <space> !
      ($o == 32) || ($o == 33) || 
      // # $ %
      ($o >= 35 && $o <= 37) || 
      // ( ) * + , - . /
      ($o >= 40 && $o <= 47) || 
      // numbers
      ($o >= 48 && $o <= 57) ||
      // : ;
      ($o == 58) || ($o == 59) ||
      // = ?
      ($o == 61) || ($o == 63) ||
      // @
      ($o == 64) ||
      // uppercase
      ($o >= 65 && $o <= 90) ||
      // [ \ ] ^ _ `
      ($o >= 91 && $o <= 96) || 
      // lowercase
      ($o >= 97 && $o <= 122) || 
      // { | } ~
      ($o >= 123 && $o <= 126)
    );
    
    // if it's valid, just keep it
    if ($v) {
      $r .= $s[$i];
    
    // &
    } elseif ($o == 38) {
      $r .= '&amp;';
    
    // <
    } elseif ($o == 60) {
      $r .= '&lt;';
    
    // >
    } elseif ($o == 62) {
      $r .= '&gt;';
    
    // '
    } elseif ($o == 39) {
      $r .= '&apos;';
    
    // "
    } elseif ($o == 34) {
      $r .= '&quot;';
    
    // unknown, add it as a reference
    } elseif ($o > 0) {
      if ($hex) {
        $r .= '&#x'.strtoupper(dechex($o)).';';
        
      } else {
        $r .= '&#'.$o.';';
      }
    }
  }
  
  return $r;
}

/**
 * xmlentity_decode
 * 
 * Converts XML entity encoded data back to a unicode string
 *
 * @param string $s The XML encoded string
 * @param array $entities Additional entities to decode (optional)
 * @return string
 * @dependencies unicode_chr()
 * @author Dom Hastings
 */
function xml_entity_decode($s, $entities = array()) {
  // if the string is empty, just return it
  if (empty($s)) {
    return $s;
  }
  
  // check that entities is an array
  if (!is_array($entities)) {
    throw new Exception('xmlentity_decode expects argument 2 to be array.');
  }
  
  // initialise vars
  $r = '';
  $l = strlen($s);
  
  // merge the entities with the defaults (amp, lt, gt, apos and quot MUST take precedence)
  $entities = array_merge($entities, array(
    'amp' => '&',
    'lt' => '<',
    'gt' => '>',
    'apos' => '\'',
    'quot' => '"'
  ));
  
  // loop through the string
  for ($i = 0; $i < $l; $i++) { 
    // if it looks like an entity
    if ($s[$i] == '&') {
      // initialise some vars
      $e = '';
      $c = '';
      
      // loop until we find a semi-colon
      for ($j = ++$i; ($c != ';' && $j < $l); $j++) {
        // get the char
        $c = $s[$j];
        
        // if it's not a semi-colon
        if ($c != ';') {
          // add it to the temporary entity string
          $e .= $c;
        }
      }
      
      // update the index
      $i = ($j - 1);
      
      // if the first char is a #, it's a numeric entity
      if ($e[0] == '#') {
        // if the second char is x it's a hexadecimal entity
        if ($e[1] == 'x') {
          // store the number
          $e = hexdec(substr($e, 2));
          
        } else {
          // store the number
          $e = substr($e, 1);
        }
      }
      
      // if we got a number
      if (is_numeric($e)) {
        // get the unicode char from it
        $r .= unicode_chr($e);
      
      // otherwise
      } else {
        // if it's in our array (which it should be)
        if (array_key_exists($e, $entities)) {
          // append the character
          $r .= $entities[$e];
        
        // otherwise
        } else {
          // throw an exception, we don't know what to do with this
          throw new Exception('Unknown entity "'.$e.'"');
        }
      }
    
    // if it's just a regular char
    } else {
      // append it
      $r .= $s[$i];
    }
  }
  
  return $r;
}

$s = '<strong>This</strong> should be safe, but don\'t assume!<br/>';
print '<Field>'.xmlentities($s).'</Field>';
