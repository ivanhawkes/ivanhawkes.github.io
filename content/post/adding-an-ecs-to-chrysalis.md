---
title: "Adding EnTT ECS to Chrysalis"
date: 2019-12-31T22:48:08+10:00
type: "post"
tags: ["C++","Chrysalis", "CRYENGINE 5.6","Game Programming"]
description: "I discuss the process of adding EnTT ECS into Chrysalis."
category: Programming
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

In this article I will discuss the process I followed and the results of integrating the [EnTT](https://github.com/skypjack/entt) Entity Component System (ECS) into Chrysalis.
<!--more-->

The work to date is available in my [Github repository](https://github.com/ivanhawkes/Chrysalis) with the specific code at the time of writing being under this [squashed commit](https://github.com/ivanhawkes/Chrysalis/commit/9d60e35e7cc1cd6af2227917c1be2fc7da75e03a).

But first, let's quickly dive into the murky waters of programmer motivation and the endless sea of work and time that threatens to drown even the most enthusiastic.

If you read the commit log you can see I actually started work on this November 1, 2019. That seems a long time ago as I sit here, on New Year's Eve. So what happened?

I've been working on this for almost seven years. It's slow progress because I am having to learn vast amounts of new things, and much of it isn't from handy YouTube videos, but rather from reading blocks of decade old code. That's enough to sap even the mightiest of spirits over the long term. I take lengthy breaks along the way  to give my mind a rest from thinking about something that seems so far off.

Being able to show off the results of the work is always rewarding, and although - to the untrained eye, there is almost nothing happening, the code is all working away in the background.

Thanks to GDC, YouTube, and programmer blogs I have learnt about the very interesting idea of an ECS. I leant c++ sometime in the early 90's and they really hammered home the object oriented paradigm so much that I grew sick of the word paradigm. That's why my ears pricked up when hearing there was a good solution to some of the common problems found in RPG games. By eschewing OOP I could free myself from it's tentacles and the dreaded and frequently stupid inheritance it forced upon me. Better still, I could improve memory layout and cache coherence - which would be a factor if I ever make it far enough to launch a multi-player version of the toolkit.

ECS works by getting you to decompose your data down to orthogonal components and then re-compose them into entities. You write systems that iterate over the entities and then execute the data they contain in a data driven approach. For me, it's similar to working out a data schema for a database, getting it to third normal form, and then cutting the tables up even more until they are just independent concepts. I'll offer an example a little further down.

Using an ECS means short term effort and time which should pay itself back many times over the long term. I decided on using EnTT based on the simple and hopefully effective metric of the most stars on Github. It's already proven itself a good decision as the API is well designed, the code is fast and lean, and the main developer is very helpful.

Having made the decision to try and integrate the ECS into my code, it was just a matter of knuckling down and getting the job done. At least, that's what you would think, it was actually a little more challenging than adding a new SDK and a line to my cmake file.

EnTT uses the latest compilers and won't build without c++17. By contrast, CRYENGINE has a 15 year history, a lot of kruft, and is happier with older compilers. In fact, some parts (very few to be fair) simply wouldn't build with the newest compilers. This hit both myself and another developer at various points as the ever keen to update MSVC convinced me to update to new compilers. I shouldn't have done it, because I once again found myself deleting both MSVC 2017 and 2019 and re-installing from scratch. I lost a couple of days from messing with my development environment, something I should be old enough to resist doing.

With the environment back in action, and the sizeable and complex CRYENGINE code all building once more, I jumped back into investigating EnTT. It looked good, but only a tracer bullet would show if it was suitable for my tasks.

EnTT does some things with c++ that I have honestly never encountered before. That's a good thing. I like to stretch and grow, but first - the growing pains. It's very heavily templated, and the first blockade I hit was mostly motivational and template driven.

Looking at the test code, it wasn't hard to slap together a very simple test that ensured EnTT code was running with my code. That was confirmed pretty quickly. What I was really worried about was serialising the data to and from some files. For some reason I can't comprehend why three things in c++ just plain suck.

* strings, wide strings, localised strings
* serialisation of plain old data structures
* reflection

The last two are related. The strings one seems to be because everyone thinks they can write a better string class. Then you need to convert the string classes of one library to the string classes of another. I don't even want to talk about wide strings and localisation.

What I wanted before I doubled down on the library was to make sure I could serialise to and from files - preferably TOML, JSON if that failed, and worst case - XML. Spoiler alert, I ended up with XML. Finding out my options - and then just relenting and using XML burnt up a lot of real world time and mind space. Now, part of this was because the documentation was a little weak around the subject of snapshots. Part was the way getting one little thing wrong would spew out 20 long indecipherable template errors. Part was the CRYENGINE code having two / three different but somewhat entangled serialisation sections. Part was me just hating XML and not leaning in like I should have - since the CRYENGINE library had decent enough support for it. The final part was an actual bug in the EnTT library which the developer not only helped me diagnose, but then quickly fixed and pushed a release. This had taken a lot of real world time, though in reality it wasn't more than a couple of days of actual work.

By December 20th I had the library integrated and sufficiently exercised for me to feel confident in it's use. I had a few test components which I could create in memory, write to files, and read back. It was time to double down! This is where we really hit the turbo.

It's hard to think of an RPG without thinking about a character who battles non-player characters. They cast spells using their qi (chi / mana), and take hits from enemies as damage to their health. If I wanted to make the core of an RPG I could do far worse than try and create a set of components and systems that allow me to simulate an entity with health, qi, and a list of spells. This turns out to be surprisingly easy, if a little verbose, when you have an ECS.

I start out by defining an attribute. Health, qi, wisdom, strength, spell power - they are all just attributes - so I try and kick off with that.

```cpp
template<typename TYPE>
struct AttributeType
{
	AttributeType() = default;
	virtual ~AttributeType() = default;

	AttributeType(TYPE base, TYPE baseModifiers, TYPE modifiers) :
		base(base), baseModifiers(baseModifiers), modifiers(modifiers)
	{
	}


	bool Serialize(Serialization::IArchive& archive)
	{
		archive(base, "base", "base");
		archive(baseModifiers, "baseModifiers", "baseModifiers");
		archive(modifiers, "modifiers", "modifiers");

		return true;
	}

	/** Returns the current value for base, after it's modifiers have been applied. */
	const TYPE GetBaseAttribute() const
	{
		return base + baseModifiers;
	}


	/** Returns the current value for the attribute, after it's modifiers have been applied. */
	const TYPE GetAttribute() const
	{
		return base + modifiers;
	}

	/** Represents the attribute without any modifiers applied to it. */
	TYPE base;

	/** This modifier makes changes to the base value, instead of the frame value. Typical use would be for a health / strength 
	buff that increases the base value of the attribute. */
	TYPE baseModifiers;

	/** Modifiers for this frame. Should be calculated each frame prior to calculating the current value. */
	TYPE modifiers;
};
```

It feels a little loose, but at this stage I am willing to trust it will be used correctly. Writing setters and getters is busy work, and I'd rather keep the code open for the moment. The main thing wrong here is it's a template but I didn't restrict it to types that have plus operators, so it will fail if you use strings as the TYPE. I should really learn how to write an error condition for that. my template-fu is still pretty weak.

With that sorted, what's the one thing that entities almost all have? A name. It's tempting to add it to some other component, but let's try and keep this pure.

```cpp
struct Name : public IComponent
{
	Name() = default;
	virtual ~Name() = default;

	Name(string name, string displayName) :
		name(name), displayName(displayName)
	{
	}
	

	inline bool operator==(const Name& rhs) const { return 0 == memcmp(this, &rhs, sizeof(rhs)); }


	const CryGUID& GetGuid() const override final
	{
		static CryGUID guid = "{8BEB64DA-F589-4671-96E9-D136A5E5DED7}"_cry_guid;

		return guid;
	}


	virtual const entt::hashed_string& GetHashedName() const
	{
		static constexpr entt::hashed_string nameHS {"name"_hs};

		return nameHS;
	}


	static void ReflectType(Schematyc::CTypeDesc<Name>& desc)
	{
		desc.SetGUID(Name().GetGuid());
		desc.SetLabel("Name");
		desc.SetDescription("Name");
	}


	bool Serialize(Serialization::IArchive& archive) override final
	{
		archive(name, "name", "name");
		archive(displayName, "displayName", "displayName");

		return true;
	}

	/** A unique name for this particular item class. */
	string name;

	/** A name which can be used in the UI. */
	string displayName;
};
```

Whew, there's a lot of boiler-plate code just to get a couple of simple fields of data. That's not a requirement of EnTT, but rather CRYENGINE. I decided to make life for future me better by ensuring both serialisation paths can be supported. One is for general use, the other for components that are used in Schematyc / editor. It's probably overkill, but worth the pain, for now. EnTT actually has snapshots, and if I had persevered and gotten the snapshot loader to work I could skip all this. Future me can do that. I'll skip the boiler-plate for subsequent code.

Now we are getting to the good part. Adding a health component and a damage component give us the start of a health system.

```cpp
struct Health : public IComponent
{
	Health() = default;
	virtual ~Health() = default;

	Health(AttributeType<float> health) :
		health(health)
	{
	}

	/** Health attribute. */
	AttributeType<float> health;

	/** Is the actor dead? */
	bool isDead {false};
};
```

```cpp
struct Damage : public IComponent
{
	Damage() = default;
	virtual ~Damage() = default;

	Damage(float quantity, DamageType damageType) :
		quantity(quantity), damageType(damageType)
	{
	}

	/** Modify an attribute by this amount. */
	float quantity;

	/** The type of damage. */
	DamageType damageType;
};
```

There's actually one more component which is needed now. Damage is no good if we don't know who caused it to whom. Let's add a component that is general enough to work for not just damage, but other special cases too.

```cpp
struct SourceAndTarget : public IComponent
{
	SourceAndTarget() = default;
	virtual ~SourceAndTarget() = default;

	SourceAndTarget(entt::entity sourceEntity, entt::entity targetEntity) :
		sourceEntity(sourceEntity), targetEntity(targetEntity)
	{
	}

	/** The source of the heal. */
	entt::entity sourceEntity;

	/** The target that will receive the heal - require a Health component. */
	entt::entity targetEntity;
};
```

Now we just need a system that executes these components and applies their changes. It's simple enough. I'm actually only going to show this one system, because the others are pretty similar. They apply damage over time, heals, and qi management instead.

```cpp
void SystemApplyDamage(entt::registry& registry)
{
	// Apply any damage to the damage modifiers.
	auto view = registry.view<ECS::Damage, ECS::SourceAndTarget>();
	for (auto entity : view)
	{
		// Get the components.
		auto& damage = view.get<ECS::Damage>(entity);
		auto& sourceAndTarget = view.get<ECS::SourceAndTarget>(entity);
		auto& targetHealth = registry.get<ECS::Health>(sourceAndTarget.targetEntity);

		// Get the health component for the target entity and apply the damage to it's health modifier.
		targetHealth.health.modifiers -= damage.quantity;

		// Remove just the component.
		registry.remove<ECS::Damage>(entity);
	}
}
```

It takes a fair amount of groundwork to set up, but very little actual code to execute each update. Here you can see a view (query) of the registry (place where all the entities are stored). It only considers entities with both a ECS::Damage and a ECS::SourceAndTarget. Using that data, it looks up the target entity, finds it's health component and applies the changes required.

When all the damage and heals have been applied to the attributes and their modifiers we run through once more and mark the dead. At some point I will have to take some action, but not today, Death, not today.

```cpp
void SystemHealthCheck(entt::registry& registry)
{
	// Update each health component, applying the modifier to it's base to calculate the current health.
	// Update death status if appropriate.
	auto view = registry.view<ECS::Health, ECS::SourceAndTarget>();
	for (auto entity : view)
	{
		// Get the components..
		auto& health = view.get<ECS::Health>(entity);

		// Check for overkill.
		float newHealth = health.health.GetBaseAttribute() + health.health.modifiers;
		if (newHealth <= 0.0f)
		{
			health.isDead = true;

			// TODO: Inform them they died with -newHealth being the amount of overkill.
		}
	}
}
```

And now, we finally get to the fun part - creating some spells. We'll start with something really bare bones, and expand it from there. Just a spell name and a range will do - oh wait, we have a name component already, so our spell only has range right now - and even that isn't being used.

EnTT let's you use as many registries as you want, and includes the ability to clone entities from one into another. This allows me to prototype the spells using XML and the components, clone it across to the actor registry, and then apply the damage / qi changes to the actors involved.  I started with a couple of the really obvious spells.

```xml
<entities>

 <entity>
  <components>
   <name CryXmlVersion="2" name="Fireball" displayName="Fireball"/>
   <spell CryXmlVersion="2" spell-rewire="damage" range="30"/>
   <damage CryXmlVersion="2" quantity="14" damageType="fire"/>
   <utilise-qi CryXmlVersion="2" quantity="7"/>
  </components>
 </entity>

 <entity>
  <components>
   <name CryXmlVersion="2" name="Shadow Word Pain" displayName="Shadow Word Pain"/>
   <spell CryXmlVersion="2" spell-rewire="damage" range="25"/>
   <damage-over-time CryXmlVersion="2" quantity="2" damageType="unholy" duration="10" interval="1.5"/>
   <utilise-qi CryXmlVersion="2" quantity="6"/>
  </components>
 </entity>

 <entity>
  <components>
   <name CryXmlVersion="2" name="Heal" displayName="Heal"/>
   <spell CryXmlVersion="2" spell-rewire="heal" range="25"/>
   <heal CryXmlVersion="2" quantity="17"/>
   <utilise-qi CryXmlVersion="2" quantity="8"/>
  </components>
 </entity>

 <entity>
  <components>
   <name CryXmlVersion="2" name="Renew" displayName="Renew"/>
   <spell CryXmlVersion="2" spell-rewire="heal" range="25"/>
   <heal-over-time CryXmlVersion="2" quantity="3" duration="10" interval="2"/>
   <utilise-qi CryXmlVersion="2" quantity="8"/>
  </components>
 </entity>

 <entity>
  <components>
   <name CryXmlVersion="2" name="Innervate" displayName="Innervate"/>
   <spell CryXmlVersion="2" spell-rewire="regenerate" range="25"/>
   <replenish-qi-over-time CryXmlVersion="2" quantity="4" duration="10" interval="2"/>
   <utilise-qi CryXmlVersion="2" quantity="20"/>
  </components>
 </entity>

</entities>
```

With all this in place I can finally fire up the editor and witness the glory of...some debug text changing values. I haven't added any of the important parts yet. Range doesn't work, and spells care not if they land on friend or foe. Health and qi allow you as large a mortgage as you please, and death never comes to visit.

What we do have now however is fairly significant.

I can connect to a character in the world, make them walk, jog, crouch and run. Switch between first and third person cameras. Target another actor by looking at them, and trigger a range of spells whose effects are all data driven. Soon enough that will be replete with special effects, animations, cooldowns and all the other accoutrements. For now, it's enough, and a good end to the old year with a positive start to the new year.

For years now it's felt like walking through molasses, but now, things are changing at a rapid pace and the future looks bright.