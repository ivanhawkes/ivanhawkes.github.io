---
type: post
title: Matrices, Vectors, Quaternions and CryEngine 3
date: 2014-06-21
tags: ["CryEngine 3","CryEngine3","Mathematics","matrices","matrix","quaternions","Software Development","third person camera","vectors"]
category: Math and Physics
image: /img/site/category/physics.jpg
image-thumbnail: /img/site/category/physics.jpg
author: "Ivan Hawkes"
---

This article will introduce you to matrices, vectors and quaternions and how you can use them for programming games using the [CryEngine SDK](http://cryengine.com "CryEngine"). You will only need a basic understanding of mathematics, beginner level c++ and a general knowledge of the CryEngine SDK; in particular, the gamesdk.dll code which is written in c++.
<!--more-->

Example code will be taken from the work I am presently doing to implement various types of third person camera views.

The code is stored in a Git repository on [BitBucket](https://bitbucket.org/ivanhawkes/plugin-camera "Plugin Camera Code").

The article is not looking to be a comprehensive guide to matrics, vectors and quaternions, but rather introduce them in a way that is relevant to authors of 3D games.

## It All Starts With a Point

Before we can introduce the stars of the show we need to lay out a little groundwork. [Wikipedia](http://en.wikipedia.org/ "Wikipedia") defines a [cartesian coordinate system](http://en.wikipedia.org/wiki/Cartesian_coordinate_system "Cartesian Coordinate System") as:

> A Cartesian coordinate system is a coordinate system that specifies each point uniquely in a plane by a pair of numerical coordinates, which are the signed distances from the point to two fixed perpendicular directed lines, measured in the same unit of length. Each reference line is called a coordinate axis or just axis of the system, and the point where they meet is its origin, usually at ordered pair (0, 0). The coordinates can also be defined as the positions of the perpendicular projections of the point onto the two axes, expressed as signed distances from the origin.

All of which is all a little overwhelming.

Instead of that huge explanation, just think of a piece of graph paper or a map with grid lines drawn on it. Cartesian coordinates are how you can refer to any single point on that map. For example, in a typical team deathmatch the location of the red base might be at (23, 12) and the blue base might be at (134, 120).

When writing a 3D game you need to extend that map into a third dimension, one that represents height or depth. Now your coordinates might look more like (23, 12, 18) and (134, 120, 18) where the first two values for each location represent it's X, Y position and the third represents Z, it's height above the origin.

You can represent any point in space in a 3D game using just three coordinates - X, Y and Z.

When using c++ you might think about storing each set of coordinates as a struct, but it turns out there's a better way.

## Matrices

Matrices is the plural form of the word '[matrix](http://en.wikipedia.org/wiki/Matrix_(mathematics) "Matrix")'. There is a whole branch of mathematics dedicated to matrices and their many uses.

During my 10th year of school I took an entire semester of matrices and vectors. The teacher was coasting through his last years before retirement,the subject matter was dry and uninteresting and seemed to have little practical application in my daily life. At the same time I was learning differentiation and integration in another mathematics class. I assumed that once that semester was over I would never see either of them again and so paid the least amount of attention practical. And I was right, at least until I wanted to write some 3D software and then matrices and vectors came back with a vengeance, and a new friend - the [quaternion](http://en.wikipedia.org/wiki/Quaternion "Quaternion"). Happily, I never saw differentiation and integration again.

There's a [comprehensive definition of matrices](http://en.wikipedia.org/wiki/Matrix_(mathematics) "Matrices") at Wikipedia, but I'm going to cut right through all that and tell you the only thing you really need to know about them. In simple terms, matrices are one or more dimensional arrays. In CryEngine those arrays are almost always going to contain floating point numbers that represent a coordinate in three or four dimensions. We'll get back to why they can have four dimensions when I introduce you to quaternions. For now it's enough to know that the sorts of matrix you are likely to run into when working with CryEngine are:

* vector - 1 x 3 floats
* quaternion - 1 x 4 floats
* matrix34 (e.g. world matrix) - 3 x 4 floats

The good people of CryTek have already done all the hard work and implemented a comprehensive and fast set of classes and operations that deal with matrices for you. You can concentrate on the high level details of how to use them and ignore the low level details of how to implement them.

Before we move on I should mention that the reason points, vectors, quaternions and the like are expressed as matrices is because matrices have a few very useful operations that can be performed on them.

* Matrices can be added to or subtracted from each other
* Matrices can be scaled
* Matricies can be multiplied by other matrices

These operations will help us to perform 3D movements such as translation (move), rotation and scaling.

## Vectors

Wikipedia, ever the fan of brevity and clarity provides an introductory paragraph on [vectors](http://en.wikipedia.org/wiki/Euclidean_vector "Vector Definition"):

> In mathematics, physics, and engineering, a Euclidean vector (sometimes called a geometric or spatial vector, or-as here-simply a vector) is a geometric quantity having magnitude (or length) and direction expressed numerically as tuples [ x, y, z ] splitting the entire quantity into its orthogonal-axis components.

In layman terms a vector can be thought of simply as an arrow pointing somewhere. The arrow has both length and direction but it does not have an origin. A vector is always an offset from a position, it doesn't actually define a position in space - but rather a distance and a direction. You will use vectors to translate (move) things around in the 3D space.

Vectors are represented in CryEngine as a one dimensional array with three floating point elements [x, y, z]. For example, a vector that represents an offset of 1 metre in the positive x direction would be  [1.0f, 0.0f, 0.0f]. In camera space that would equate for a position 1 metre to the right of the present position.

## Euler Angles

Once again we begin with a [definition from Wikipedia](http://en.wikipedia.org/wiki/Euler_angles "Wikipedia Definition of Euler Angles"):

> The Euler angles are three angles introduced by Leonhard Euler to describe the orientation of a rigid body.To describe such an orientation in 3-dimensional Euclidean space three parameters are required. They can be given in several ways, Euler angles being one of them. Euler angles are also used to represent the orientation of a frame of reference (typically, a coordinate system or basis) relative to another. They are typically denoted as _α_, _β_, _γ_, or ![\varphi, \theta, \psi](2794c7dc86ef9681d291abec7bc11de4.png).

Hopefully you did geometry in school and recognise that Euler angles are those familiar old friends represented with degrees and radians. If not, now is the time to hit Wikipedia.

## Quaternions

Let's have a quick read of the [Wikipedia definition for quaternions](http://en.wikipedia.org/wiki/Quaternion "Wikipedia - Quaternion")...I'm quoting a generous chunk here so you can drink deeply at the well of confusion:

> In mathematics, the quaternions are a number system that extends the complex numbers. They were first described by Irish mathematician William Rowan Hamilton in 1843 and applied to mechanics in three-dimensional space. A feature of quaternions is that multiplication of two quaternions is noncommutative. Hamilton defined a quaternion as the quotient of two directed lines in a three-dimensional space or equivalently as the quotient of two vectors.
> 
> Quaternions find uses in both theoretical and applied mathematics, in particular for calculations involving three-dimensional rotations such as in three-dimensional computer graphics and computer vision. In practical applications, they can be used alongside other methods, such as Euler angles and rotation matrices, or as an alternative to them depending on the application.
> 
> In modern mathematical language, quaternions form a four-dimensional associative normed division algebra over the real numbers, and therefore also a domain. In fact, the quaternions were the first noncommutative division algebra to be discovered. The algebra of quaternions is often denoted by H (for Hamilton), or in blackboard bold by ![\mathbb H](827d1849944680ea19cd0ea9ee4d598b.png) (Unicode U+210D, ℍ). It can also be given by the Clifford algebra classifications Cℓ0,2(R) ≅ Cℓ03,0(R). The algebra H holds a special place in analysis since, according to the Frobenius theorem, it is one of only two finite-dimensional division rings containing the real numbers as a proper subring, the other being the complex numbers. These rings are also Euclidean Hurwitz algebras, of which quaternions are the largest associative algebra.
> 
> The unit quaternions can therefore be thought of as a choice of a group structure on the 3-sphere S3 that gives the group Spin(3), which is isomorphic to SU(2)

Seriously...! You need a degree in mathematics just to work out the explanation for quaternions. Luckily you don't need to understand everything about them in order to start working with them. Let's cut to the chase.

Quaternions take advantage of some cool properties of complex numbers and a fourth dimension of space (imaginary) in order to quickly, easily and accurately allow you to rotate stuff in three dimensional space. If you want to rotate it, think quaternions.

There is a truly excellent and complete explanation of quaternions involving [blowing up the Death Star](http://acko.net/blog/animate-your-way-to-glory-pt2/ "Animate Your Way To Glory") from Star Wars. Do yourself a favour and spend an hour working through the flash animation tutorial. It's both fun and informative.

## Putting It All Together

CryEngine, like many other 3D game engines represents everything inside the game world using just these basic building blocks; every entity within the game has a position, a rotation and a scale.

* Position is represented with a Vec3 - a type definition for a vector
* Rotation is represented with a Quat - a type definition for a quaternion
* Scale is represented with a Vec3 - a type definition for a vector which allows independent scaling in all three dimensions

It's time to look at some real code and see not only what we can do with these concepts, but also how to do it using CryEngine. I'm using code from my camera project because it uses a fair amount of different concepts in a way that is easy to understand.

We'll be looking at what steps are needed in order to implement an action RPG style of camera. This sort of camera freely orbits around the player following the outline of an imaginary sphere that surrounds the player. The player can zoom in and out, and rotate around their character while adjusting their pitch and yaw. Each game frame CryEngine will make a call to our camera routine and ask us to calculate the position and rotation of the camera relative to the player's character. We'll start with a look at the entire function and then break it down from there:

```cpp
CCameraPose ActionRPGCamera::UpdateView(const CPlayer &clientPlayer, SViewParams &viewParams, float frameTime)
{
    if (gEnv && gEnv->pGame && gEnv->pGame->GetIGameFramework() && m_isEnabled && !gEnv->IsCutscenePlaying())
    {
        // Make sure we have an actor and are in third person mode.
        IActor *pClient = gEnv->pGame->GetIGameFramework()->GetClientActor();
        if (pClient && !pClient->IsThirdPerson())
            return CCameraPose(viewParams.position, viewParams.rotation);

        // Should we invert pitch movements?
        float invertYAxis = cl_tpvInvertYAxis ? 1.0 : -1.0;

        // XBox controller yaw / pitch deltas need processing.
        ApplyXIPitchYaw(frameTime);

        // Calculate pitch and yaw movements to apply both prior to and after positioning the camera.
        Quat quatPreTransYP = Quat(Ang3(DEG2RAD(cl_tpvViewPitch * invertYAxis), 0.0f, DEG2RAD(cl_tpvViewYaw)));
        Quat quatPostTransYP = Quat::CreateRotationXYZ(Ang3(DEG2RAD(cl_tpvViewPitch * invertYAxis * m_reversePitchTilt), 0.0f, 0.0f));

        // Target and aim position come from the entity position.
        Vec3 vecTargetInitialPosition;
        Vec3 vecTargetInitialAimPosition;
        GetTargetPositions(m_pEntity, m_targetBoneName, m_targetAimBoneName, vecTargetInitialPosition, vecTargetInitialAimPosition);

        // The distance from the view to the target.
        float zoomDistance = m_targetDistance * abs(cl_tpvZoom);

        // Work out where to place the new initial position. We will be using a unit vector facing forward Y
        // as the starting place and applying rotations from the target bone and player camera movements.
        Quat quatTargetRotationGoal = m_quatTargetRotation * quatPreTransYP;
        Quat quatTargetRotation = Quat::CreateSlerp(m_quatLastTargetRotation, quatTargetRotationGoal, frameTime * m_slerpSpeed);
        m_quatLastTargetRotation = quatTargetRotation;
        Vec3 vecViewPosition = vecTargetInitialPosition + (quatTargetRotation * (Vec3(0.0f, 1.0f, 0.0f) * zoomDistance));

        // By default, we try and aim the camera at the target, taking into account
        // the current mouse yaw and pitch values. If, by chance, the target and the view position
        // are the same, then we cheat and use the initial target rotation - which should provide an
        // acceptable result, hopefully. Avoid this by not allowing to zoom too close to the target.
        Vec3 vecAimAtTarget = (vecTargetInitialAimPosition - vecViewPosition).GetNormalized();
        Quat quatViewRotationGoal = vecAimAtTarget.IsZero() ? quatTargetRotation : Quat::CreateRotationVDir(vecAimAtTarget);

        // Use a slerp to smooth out fast camera rotations.
        Quat quatViewRotation = Quat::CreateSlerp(m_quatLastViewRotation, quatViewRotationGoal, frameTime * m_slerpSpeed);

        // Applying a camera translation at this point will move both the camera and the place it is aiming. We
        // want to do this using camera space.
        vecViewPosition += quatViewRotation * m_postTransOffset;
        Vec3 vecTargetAimPosition = vecTargetInitialAimPosition + quatViewRotation * m_postTransOffset;

        // Gimbal style rotation after it's moved into it's initial position.
        Quat quatOrbitRotation = quatViewRotation * quatPostTransYP;

        // Perform a collision detection. Note, any collisions will disallow use of interpolated
        // camera movement.
        CollisionDetection(vecTargetAimPosition, vecViewPosition);

        // Track the last known camera position.
        m_vecLastPosition = vecViewPosition;
        m_quatLastViewRotation = quatViewRotation;

#ifdef _DEBUG
        if (m_isDebugAllowed)
        {
            // Initial position for our target.
            gEnv->pRenderer->GetIRenderAuxGeom()->DrawSphere(vecTargetInitialPosition, 0.16f, ColorB(0, 0, 128));

            // Position at which we are aiming.
            gEnv->pRenderer->GetIRenderAuxGeom()->DrawSphere(vecTargetAimPosition, 0.12f, ColorB(255, 0, 0));
        }
#endif

        // Return our new calculated camera pose.
        return CCameraPose(m_vecLastPosition, quatOrbitRotation);
    }

    // Worst case! We return a view based on the view params that were passed in.
    return CCameraPose(viewParams.position, viewParams.rotation);
}
```

Prior to this routine being called various member values are already loaded with details of the entity that represents our player and the amount of yaw and pitch to be applied to the view.

I start off by making a quick call to a routine to take XBox controller movements into account and also figure out if the player prefers to invert their mouse pitch movements (flight simulator style).

```cpp
// Should we invert pitch movements?
float invertYAxis = cl_tpvInvertYAxis ? 1.0 : -1.0;

// XBox controller yaw / pitch deltas need processing.
ApplyXIPitchYaw (frameTime);
```

Prior to positioning the camera I calculate a pair of quaternions which will be used to rotate it, before and after initial positioning is calculated.

```cpp
// Calculate pitch and yaw movements to apply both prior to and after positioning the camera.
Quat quatPreTransYP = Quat (Ang3 (DEG2RAD (cl_tpvViewPitch * invertYAxis), 0.0f, DEG2RAD (cl_tpvViewYaw)));
Quat quatPostTransYP = Quat::CreateRotationXYZ (Ang3 (DEG2RAD (cl_tpvViewPitch * invertYAxis * m_reversePitchTilt), 0.0f, 0.0f));
```

These two statements demonstrate two of the many different methods of creating a quaternion. In the first statement you can see I am taking values for pitch and yaw (tracked separately by an input handler), expressing them in radians and converting the result to an angle (Ang3). I then use a constructor that takes an angle as a parameter and returns the desired quaternion.

The second statement shows something very similar. In this case I want to produce a rotation that only affects the x axis, which when applied to a player camera will affect the pitch of that camera. Applying a rotation (after initially positioning the camera) gives me the ability to simulate the effect of the camera being mounted on a [gimbal](http://en.wikipedia.org/wiki/Gimbal "Wikipedia - Gimbal"). In this case I am only using it to adjust their pitch by a fractional amount in the opposite direction, which gives the camera a nicer movement when decent factors are applied.

We now have our first two quaternions which represent a rotation of some form in three dimensions.

Skipping a little of the code which is simply retrieving the coordinates of our entity we come to:

```cpp
// The distance from the view to the target.
float zoomDistance = m_targetDistance * abs (cl_tpvZoom);
```

There's nothing complex happening here. I am simply calculating how far away to place the camera based on the present amount of zoom. The result, zoomDistance, is the distance away in metres to place the camera.

```cpp
// Work out where to place the new initial position. We will be using a unit vector facing forward Y
// as the starting place and applying rotations from the target bone and player camera movements.
Quat quatTargetRotationGoal = m_quatTargetRotation * quatPreTransYP;
Quat quatTargetRotation = Quat::CreateSlerp (m_quatLastTargetRotation, quatTargetRotationGoal, frameTime * m_slerpSpeed);
m_quatLastTargetRotation = quatTargetRotation;
Vec3 vecViewPosition = vecTargetInitialPosition + (quatTargetRotation * (Vec3 (0.0f, 1.0f, 0.0f) * zoomDistance));
```

Now we are trying to calculate where the view position should be, but first you need to know what happens when you multiply a vector, add / subtract a vector or multiply a quaternion.

Remember, a vector is just a representation of a direction and a distance.  Adding two vectors together will give a result vector that represents the same coordinate translation as the two vectors combined. For example:

The player starts play at the origin (0.0, 0.0, 0.0). In the first frame they move along a vector (0.0, 1.0, 0.0) which represents 1 meter forward (in camera space, this is from the viewpoint of the player in first person mode). In the second frame they move along a vector (2.0, 0.0, 3.0). In camera space this represents a movement 2 metres to the right and 3 metres in height.

The result of adding both these vectors together is the vector (2.0, 1.0, 3.0) which represents a displacement (movement) of 2 metres to the right, 1 metre forward and 3 metres upwards.

Adding a third vector (0.0, -1.0, 0.0) - a step 1 metre backwards, results in the vector (2.0, 0.0, 3.0).

Vectors can be added together in any order and still give the same result. When subtracting one vector from another however, the order counts.

v1 + v2 = v2 + v1

v1 - v2 ≠ v2 - v1

In the example above we were still adding the vectors, but we stepped backwards because the sign of Y was negative, in this case -1.0.

Subtraction of two vectors may also be performed by adding the opposite of the second vector to the first vector, that is, **a − b = a + (−b)**.

Be careful when subtracting vectors.

We'll skip over the code for handling the Spherical Linear Interpolation (SLERP).

We can see that the first part is trying to add two vectors **vecTargetInitialPosition** and the result of the expression **m_quatTargetRotation * quatPreTransYP * (Vec3 (0.0f, 1.0f, 0.0f) * zoomDistance)**

Time to break down that expression. Operator precedence rules apply and so the first part to look at is **m_quatTargetRotation * quatPreTransYP**. We are multiplying two quaternions together, the result of which will be a third quaternion which represents their total combined rotations.

NOTE: When multiply two quaternions, order counts: **q1 * q2 ≠ q2 * q1**. Swapping the order of those two quaternions will lead to different results.

To understand the result of multiplying q1 by q2, imagine a chair which is a few metres from you and facing towards you. In this case q1 represents the chair's initial rotation e.g. (0.0, 0.0, 180.0) [in degrees] - which for our example is all four legs on the floor and the seat facing towards you. Now imagine someone walking up to that chair, and without moving it, just turning it to face partly away from you. e.g.  (0.0, 0.0, 45.0) [in degrees]  - the chair now faces off to one side. That rotation is represented by q2 in the equation **q1 * q2**. The result of **q1 * q2** is a quaternion that represents both of the rotations made to the chair - the initial one which turned it towards you, and the second one where it is turned away at a 45 degree angle.

NOTE: you will need to convert degrees to radians when constructing a quaternion based on Euler angles since CryEngine uses radians - and humans usually find degrees easier to work with.

You should now understand that the expression **m_quatTargetRotation * quatPreTransYP** will give you a quaternion that represents the entitiy's initial rotation and, in this case, a second rotation based on pitch and yaw values.

### What happens when you multiply a vector by a scalar?

The result is a vector whose length is equal to the original vector's length multiplied by the scalar.

Let's try that as an example instead. If you have a vector that represents a movement of 2.5 metres in some direction and you multiply that vector by a scalar value, for example 4.0, the result will be a vector with the same direction as the original and a length of 10.0 metres.

The same applies for division of a vector by a scalar. Where things get interesting is when you divide a vector by the scalar value of it's length, the result is a unit vector.

### Unit Vector?

A unit vector is just a vector whose length is 1.0. It can have any values for direction, so long as that results in a length of 1.0.

The handy thing about unit vectors is that they allow you to calculate other vectors that have the same direction, and different lengths.

### What happens when you multiply a quaternion by a vector?

Multiplying a quaternion by a vector results in a vector of the same length, but whose direction has been rotated in space. An example might help make it clear.

Let's get back to that line of code:

```cpp
Vec3 vecViewPosition = vecTargetInitialPosition + (quatTargetRotation * (Vec3 (0.0f, 1.0f, 0.0f) * zoomDistance));
```

The expression:

```cpp
Vec3 (0.0f, 1.0f, 0.0f) * zoomDistance
```

is multiplying a vector and a scalar so we know the result is going to be another vector. The Vec3 constructor creates a vector that represents a movement forward of 1 metre in camera space. Multiplying that by the zoomDistance gives us a vector that represents a forward movement of x metres, where x is the distance we wanted to place the camera away from the player.

We already learnt that **m_quatTargetRotation * quatPreTransYP** will give us a rotation that represents the camera, pitch and yaw in world space. When we multiply that by **Vec3 (0.0f, 1.0f, 0.0f)** we get a vector representing a movement 1 metre forward in world space. Finally, multiplying that vector by zoomDistance gives us a movement of zoomDistance forward in world space. Pretty cool for one little line of code!

All together, that line takes the initial position of the target and their initial rotation, applies pitch and yaw, and then calculates a position that would be zoomDistance metres away in that direction.

Vectors and quaternions pack a hell of a punch.

### How's My Aim?

We have an initial position for the camera now, but we don't know which direction it should aim - it's rotation. The next couple of lines handle that.

```cpp
// By default, we try and aim the camera at the target, taking into account
// the current mouse yaw and pitch values. If, by chance, the target and the view position
// are the same, then we cheat and use the initial target rotation - which should provide an
// acceptable result, hopefully. Avoid this by not allowing to zoom too close to the target.
Vec3 vecAimAtTarget = (vecTargetInitialAimPosition - vecViewPosition).GetNormalized ();
Quat quatViewRotationGoal = vecAimAtTarget.IsZero () ? m_quatTargetRotation * quatPreTransYP : Quat::CreateRotationVDir (vecAimAtTarget);
```

The first thing we want to do is work out where to aim, and it's done in two steps.

```cpp
(vecTargetInitialAimPosition - vecViewPosition)
```

Here we are subtracting one vector from another, resulting in a third vector. By taking the position of the camera we just calculated and subtracting the position of the target we want to aim towards, we get the vector that represents their difference. Put simply, it's like an arrow that points from one directly to the other. It's a bit long though for the next step, since it's length is the distance between the two points. We make a call to GetNormalized () which returns a unit vector whose direction points from the aim position towards the target position. That vector can then be turned into a quaternion which is going to be useful shortly...but there's a hiccup here.

```cpp
Quat quatViewRotationGoal = vecAimAtTarget.IsZero () ? m_quatTargetRotation * quatPreTransYP : Quat::CreateRotationVDir (vecAimAtTarget);
```

We want to turn the vector into a quaternion , but sometimes that vector might be the zero vector, and that is going to cause assertion errors. We check for that possibility and set a default quaternion if it arises (and I seem to recall that default is a crappy one), otherwise we pass the vector into a quaternion constructor and out pops a lovely quaternion representing our intended rotation for the camera around the player.

Well, it's not quite the direction, we are going to apply some [spherical linear interpolation](http://en.wikipedia.org/wiki/Spherical_linear_interpolation "Wikipedia - Spherical Linear Interpolation") first just to smooth out any fast movements.

```cpp
// Use a slerp to smooth out fast camera rotations.
Quat quatViewRotation = Quat::CreateSlerp (m_quatLastViewRotation, quatViewRotationGoal, frameTime * m_slerpSpeed);
```

This line is just taking the last rotation value, the present goal rotational value, and interpolating between them according to the frameTime parameter and a slerp speed paramteter (range 0.0f to 1.0f). This causes the camera to lag a little behind where the player wants the camera to be (the goal) but in the process smooths out it's path.

A few lines further up the page you can revist the line:

```cpp
Quat quatTargetRotation = Quat::CreateSlerp (m_quatLastTargetRotation, quatTargetRotationGoal, frameTime * m_slerpSpeed);
```

Based on the line we just examined, we can see that this one is also creating a slerp between a pair of rotations using both the frameTime and an external speed factor.

The first line is providing smooth interpolation for movements that change the direction in which the view camera is going to be positioned relative to the target. The second line is doing the same thing in reverse. When the camera is moved to it's new position and we attempt to aim the camera towards the aim target - this interpolation smooths out the rotation of the view camera from the last view direction towards our new goal view direction.

We could probably get away without the second interpolation, the one on the view camera rotation, but it does make things nice and butter smooth, so it's worth the extra effort.

You can get a better feel for how spherical linear interpolation affects the camera movements by using small values for slerpSpeed. Anything below 15 will start to become noticeable, and below 5 it's quite obvious how the interpolation allows the camera to transition from one position to another while following a spherical path.

After the camera is positioned I give them the chance to apply a small translation offset, which is great for implementing 'over the shoulder' style cameras.

```cpp
// Applying a camera translation at this point will move both the camera and the place it is aiming. We
// want to do this using camera space.
vecViewPosition += quatViewRotation * m_postTransOffset;
Vec3 vecTargetAimPosition = vecTargetInitialAimPosition + quatViewRotation * m_postTransOffset;
```

There's nothing too challenging for you there. I move both the camera position and the place it's aiming. The angles stay the same but the player now always stays a little bit to the left and below the aiming position. You can offset the camera in any direction / distance you like - but having the player a little lower and to the left is pretty standard.

One last rotation is applied, allowing for gimbal movements based on some quaternions we set up earlier.

```cpp
// Gimbal style rotation after it's moved into it's initial position.
Quat quatOrbitRotation = quatViewRotation * quatPostTransYP;
```

Once again we multiply one quaternion by another to get a result that combines both rotations into one.

Finally, there's a little black box magic to work out if the camera is being occluded by terrain or geometry (collision detection).

```cpp
// Perform a collision detection. Note, any collisions will disallow use of interpolated
// camera movement.
CollisionDetection (vecTargetAimPosition, vecViewPosition);
```

I'm not going to cover the details today because my current implementation is too basic and doesn't do a good job of repositioning the camera. The basic idea however is using raycasting to work out if anything is blocking the view, and if so, to reposition the camera in front of the blocking geometry.

The last few lines just return a camera pose (position and rotation values) based on our previous calculations. Our work here is done.

## Summary

Hopefully that's enough to get you started playing with and understanding matrices, vectors and quaternions. You can improve your understanding by visiting the links to Wikipedia articles, checking out the animation [blowing up the Death Star](http://acko.net/blog/animate-your-way-to-glory-pt2/ "Animate Your Way To Glory"), studying the full [camera code source ](https://bitbucket.org/ivanhawkes/plugin-camera "Third Person Camera")or just hacking around on your own.